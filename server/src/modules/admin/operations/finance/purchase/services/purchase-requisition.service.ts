import { PaginationDto } from '@/common/dto/pagination.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { DataSource } from 'typeorm'
import {
  CreatePurchaseRequisitionDto,
  UpdatePurchaseRequisitionStatusDto,
} from '../dto/purchase-requisition.dto'
import { PRStatus, PurchaseRequisitionEntity } from '../entities/purchase-requisition.entity'
import { PurchaseRequisitionRepository } from '../repositories/purchase-requisition.repository'
import { PurchaseOrderService } from './purchase-order.service'

@Injectable()
export class PurchaseRequisitionService {
  private readonly logger = new Logger(PurchaseRequisitionService.name)

  constructor(
    private readonly repository: PurchaseRequisitionRepository,
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly cacheService: CacheService,
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
  ) {}

  async createPR(
    dto: CreatePurchaseRequisitionDto,
    ctx: RequestContextDto,
  ): Promise<PurchaseRequisitionEntity> {
    this.logger.log('Creating Purchase Requisition')
    const storeId = ctx.storeId

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Add at least one product')
    }

    const result = await this.repository.createAndSave(
      {
        justification: dto.justification,
        requiredDate: new Date(dto.requiredDate),
        branchId: dto.branchId,
        warehouseId: dto.warehouseId,
        items: dto.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId || null,
          quantity: i.quantity,
          notes: i.notes,
          storeId,
        })),
        status: PRStatus.DRAFT,
      } as any,
      ctx,
    )

    await this.cacheService.delCacheByPattern(`pr:list:*`, storeId)
    return result
  }

  async findAllPRs(
    ctx: RequestContextDto,
    paginationDto: PaginationDto,
    status?: PRStatus,
  ): Promise<{
    items: PurchaseRequisitionEntity[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const storeId = ctx.storeId
    const { page = 1, limit = 20, q: search } = paginationDto
    const [items, total] = await this.repository.findAllByStore(
      storeId,
      page,
      limit,
      search,
      status,
    )

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOnePR(id: string, ctx: RequestContextDto): Promise<PurchaseRequisitionEntity> {
    const storeId = ctx.storeId
    const pr = await this.repository.findByIdWithRelations(id, storeId)
    if (!pr) {
      throw new NotFoundException('Purchase Requisition not found')
    }
    return pr
  }

  async updatePRStatus(
    id: string,
    dto: UpdatePurchaseRequisitionStatusDto,
    ctx: RequestContextDto,
  ): Promise<PurchaseRequisitionEntity> {
    this.logger.log(`Updating PR Status: ${id} -> ${dto.status}`)
    const storeId = ctx.storeId
    const pr = await this.findOnePR(id, ctx)

    if (pr.status === PRStatus.PO_CREATED) {
      throw new BadRequestException('Cannot update status of a requisition already converted to PO')
    }

    pr.status = dto.status
    if (dto.status === PRStatus.APPROVED) {
      pr.approvedById = ctx.userId
    } else if (dto.status === PRStatus.REJECTED) {
      pr.approvedById = ctx.userId
      if (dto.rejectionReason) {
        pr.justification = pr.justification
          ? `${pr.justification}\nRejection Reason: ${dto.rejectionReason}`
          : `Rejection Reason: ${dto.rejectionReason}`
      }
    }

    const saved = await this.repository.savePR(pr)
    if (dto.status === PRStatus.APPROVED || dto.status === PRStatus.REJECTED) {
      await this.notifyPRStatus(saved, storeId)
    }
    await this.cacheService.delCacheByPattern(`pr:list:*`, storeId)
    await this.cacheService.delCache(`pr:id:${id}`, storeId)
    return saved
  }

  async convertToPO(
    id: string,
    data: { supplierId: string; referenceNumber: string },
    ctx: RequestContextDto,
  ) {
    this.logger.log(`Converting PR ${id} to Purchase Order`)
    const storeId = ctx.storeId

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const pr = await this.repository.findByIdWithRelations(id, storeId, queryRunner.manager)
      if (!pr) {
        throw new NotFoundException('Purchase Requisition not found')
      }

      if (pr.status !== PRStatus.APPROVED) {
        throw new BadRequestException(
          'Only APPROVED requisitions can be converted to Purchase Orders',
        )
      }

      const itemsDto = pr.items.map((i) => {
        // If there's a variant, see if we can find its price, otherwise use product price
        let unitPrice = 0
        if (i.variantId && (i as any).variant) {
          const variantPriceRaw = (i as any).variant.price
          if (variantPriceRaw !== undefined && variantPriceRaw !== null) {
            const parsed = Number(variantPriceRaw)
            if (!Number.isNaN(parsed)) unitPrice = parsed
          }
        }
        
        if (unitPrice === 0) {
          const productPriceRaw = (i as any).product?.price
          if (productPriceRaw !== undefined && productPriceRaw !== null) {
            const parsed = Number(productPriceRaw)
            if (!Number.isNaN(parsed)) unitPrice = parsed
          }
        }

        this.logger.log(
          `PR item product ${i.productId} (variant ${i.variantId}) -> unitPrice=${unitPrice}`,
        )
        return {
          productId: i.productId,
          variantId: i.variantId || null,
          quantity: i.quantity,
          unitPrice,
        }
      })

      // Create Purchase Order using PurchaseOrderService in transaction context
      const po = await this.purchaseOrderService.createPurchaseOrder(
        {
          supplierId: data.supplierId,
          referenceNumber: data.referenceNumber,
          items: itemsDto,
          purchaseRequisitionId: pr.id,
        } as any,
        ctx,
        queryRunner.manager,
      )

      // Validate created PO structure matches PR items
      try {
        if (!po) {
          throw new BadRequestException('Failed to create Purchase Order')
        }

        const poItemCount = (po.items && po.items.length) || 0
        const prItemCount = (pr.items && pr.items.length) || 0

        this.logger.log(
          `PR ${pr.id} items=${prItemCount} -> Created PO ${po.id} items=${poItemCount}`,
        )

        if (poItemCount !== prItemCount) {
          throw new BadRequestException('Mismatch between PR items and created PO items')
        }

        // Ensure purchaseRequisitionId is set on PO
        if (!po.purchaseRequisitionId || String(po.purchaseRequisitionId) !== String(pr.id)) {
          throw new BadRequestException('Purchase Order not linked to Purchase Requisition')
        }
      } catch (err: any) {
        this.logger.error(`Validation after PO creation failed for PR ${pr.id}: ${err.message}`)
        throw err
      }

      pr.status = PRStatus.PO_CREATED
      await queryRunner.manager.save(PurchaseRequisitionEntity, pr)

      await queryRunner.commitTransaction()

      await this.cacheService.delCacheByPattern(`pr:list:*`, storeId)
      await this.cacheService.delCache(`pr:id:${id}`, storeId)
      await this.notifyPRConverted(pr, po.id, storeId)

      return po
    } catch (error: any) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async deletePR(id: string, ctx: RequestContextDto): Promise<void> {
    const storeId = ctx.storeId
    const pr = await this.findOnePR(id, ctx)

    if (pr.status !== PRStatus.DRAFT && pr.status !== PRStatus.REJECTED) {
      throw new BadRequestException('Only DRAFT or REJECTED requisitions can be deleted')
    }

    await this.repository.savePR({ ...pr, isDeleted: true } as any)
    await this.cacheService.delCacheByPattern(`pr:list:*`, storeId)
    await this.cacheService.delCache(`pr:id:${id}`, storeId)
  }

  private async notifyPRStatus(pr: PurchaseRequisitionEntity, storeId: string): Promise<void> {
    const approved = pr.status === PRStatus.APPROVED
    try {
      await this.notificationService.createNotification(
        {
          title: approved ? 'Purchase Requisition Approved' : 'Purchase Requisition Rejected',
          message: `Purchase Requisition #${pr.prNumber} has been ${pr.status.toLowerCase()}.`,
          type: approved ? 'SUCCESS' : 'DANGER',
          link: `/admin/procurement/requisitions`,
          userId: null as any,
        },
        storeId,
      )
    } catch (e: any) {
      this.logger.error(`Failed to trigger purchase requisition notification: ${e.message}`)
    }
  }

  private async notifyPRConverted(
    pr: PurchaseRequisitionEntity,
    purchaseOrderId: string,
    storeId: string,
  ): Promise<void> {
    try {
      await this.notificationService.createNotification(
        {
          title: 'Purchase Requisition Converted',
          message: `Purchase Requisition #${pr.prNumber} was converted to a purchase order.`,
          type: 'SUCCESS',
          link: `/admin/procurement/purchases/${purchaseOrderId}`,
          userId: null as any,
        },
        storeId,
      )
    } catch (e: any) {
      this.logger.error(`Failed to trigger PR conversion notification: ${e.message}`)
    }
  }
}
