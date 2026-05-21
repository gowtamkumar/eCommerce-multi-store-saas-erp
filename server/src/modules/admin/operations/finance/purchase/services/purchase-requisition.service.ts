import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PurchaseRequisitionRepository } from '../repositories/purchase-requisition.repository'
import { PurchaseRequisitionEntity, PRStatus } from '../entities/purchase-requisition.entity'
import { CreatePurchaseRequisitionDto, UpdatePurchaseRequisitionStatusDto } from '../dto/purchase-requisition.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { PurchaseOrderService } from './purchase-order.service'
import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum'

@Injectable()
export class PurchaseRequisitionService {
  private readonly logger = new Logger(PurchaseRequisitionService.name)

  constructor(
    private readonly repository: PurchaseRequisitionRepository,
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly cacheService: CacheService,
    private readonly dataSource: DataSource,
  ) {}

  async createPR(
    dto: CreatePurchaseRequisitionDto,
    ctx: RequestContextDto,
  ): Promise<PurchaseRequisitionEntity> {
    this.logger.log('Creating Purchase Requisition')
    const tenantId = ctx.tenantId

    const result = await this.repository.createAndSave(
      {
        justification: dto.justification,
        requiredDate: new Date(dto.requiredDate),
        branchId: dto.branchId,
        warehouseId: dto.warehouseId,
        items: dto.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          notes: i.notes,
          tenantId,
        })),
        status: PRStatus.DRAFT,
      } as any,
      ctx,
    )

    await this.cacheService.delCache(`pr:list`, tenantId)
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
    const tenantId = ctx.tenantId
    const { page = 1, limit = 20, q: search } = paginationDto
    const cacheKey = `pr:list:p${page}:l${limit}:q${search || ''}:s${status || ''}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [items, total] = await this.repository.findAllByTenant(
          tenantId,
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
      },
      300,
      tenantId,
    )
  }

  async findOnePR(id: string, ctx: RequestContextDto): Promise<PurchaseRequisitionEntity> {
    const tenantId = ctx.tenantId
    const pr = await this.repository.findByIdWithRelations(id, tenantId)
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
    const tenantId = ctx.tenantId
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
    await this.cacheService.delCache(`pr:list`, tenantId)
    await this.cacheService.delCache(`pr:id:${id}`, tenantId)
    return saved
  }

  async convertToPO(
    id: string,
    data: { supplierId: string; referenceNumber: string },
    ctx: RequestContextDto,
  ) {
    this.logger.log(`Converting PR ${id} to Purchase Order`)
    const tenantId = ctx.tenantId

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const pr = await this.repository.findByIdWithRelations(id, tenantId, queryRunner.manager)
      if (!pr) {
        throw new NotFoundException('Purchase Requisition not found')
      }

      if (pr.status !== PRStatus.APPROVED) {
        throw new BadRequestException('Only APPROVED requisitions can be converted to Purchase Orders')
      }

      const itemsDto = pr.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: 0, // Set to 0 initially, updated by supplier quotation or manually
      }))

      // Create Purchase Order using PurchaseOrderService in transaction context if possible, or manually
      const po = await this.purchaseOrderService.createPurchaseOrder(
        {
          supplierId: data.supplierId,
          referenceNumber: data.referenceNumber,
          items: itemsDto,
          purchaseRequisitionId: pr.id,
        } as any,
        ctx,
      )

      pr.status = PRStatus.PO_CREATED
      await queryRunner.manager.save(PurchaseRequisitionEntity, pr)

      await queryRunner.commitTransaction()

      await this.cacheService.delCache(`pr:list`, tenantId)
      await this.cacheService.delCache(`pr:id:${id}`, tenantId)

      return po
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async deletePR(id: string, ctx: RequestContextDto): Promise<void> {
    const tenantId = ctx.tenantId
    const pr = await this.findOnePR(id, ctx)

    if (pr.status !== PRStatus.DRAFT && pr.status !== PRStatus.REJECTED) {
      throw new BadRequestException('Only DRAFT or REJECTED requisitions can be deleted')
    }

    await this.repository.savePR({ ...pr, isDeleted: true } as any)
    await this.cacheService.delCache(`pr:list`, tenantId)
    await this.cacheService.delCache(`pr:id:${id}`, tenantId)
  }
}
