import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { RfqRepository } from '../repositories/rfq.repository'
import { QuotationRepository } from '../repositories/quotation.repository'
import { RfqEntity, RFQStatus } from '../entities/rfq.entity'
import { QuotationEntity, QuotationStatus } from '../entities/quotation.entity'
import {
  CreateRfqDto,
  CreateQuotationDto,
  UpdateRfqStatusDto,
  UpdateQuotationStatusDto,
} from '../dto/rfq.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { PurchaseOrderService } from './purchase-order.service'

@Injectable()
export class RfqService {
  private readonly logger = new Logger(RfqService.name)

  constructor(
    private readonly rfqRepository: RfqRepository,
    private readonly quotationRepository: QuotationRepository,
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly cacheService: CacheService,
    private readonly dataSource: DataSource,
  ) {}

  async createRfq(dto: CreateRfqDto, ctx: RequestContextDto): Promise<RfqEntity> {
    this.logger.log('Creating RFQ')
    const tenantId = ctx.tenantId

    const result = await this.rfqRepository.createAndSave(
      {
        deadlineDate: new Date(dto.deadlineDate),
        prId: dto.prId || null,
        status: RFQStatus.OPEN,
      } as any,
      ctx,
    )

    await this.cacheService.delCache(`rfq:list`, tenantId)
    return result
  }

  async findAllRfqs(
    ctx: RequestContextDto,
    paginationDto: PaginationDto,
    status?: RFQStatus,
  ): Promise<{
    items: RfqEntity[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    const tenantId = ctx.tenantId
    const { page = 1, limit = 20, q: search } = paginationDto
    const cacheKey = `rfq:list:p${page}:l${limit}:q${search || ''}:s${status || ''}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [items, total] = await this.rfqRepository.findAllByTenant(
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

  async findOneRfq(id: string, ctx: RequestContextDto): Promise<RfqEntity> {
    const tenantId = ctx.tenantId
    const rfq = await this.rfqRepository.findByIdWithRelations(id, tenantId)
    if (!rfq) {
      throw new NotFoundException('RFQ not found')
    }
    return rfq
  }

  async updateRfqStatus(
    id: string,
    dto: UpdateRfqStatusDto,
    ctx: RequestContextDto,
  ): Promise<RfqEntity> {
    const tenantId = ctx.tenantId
    const rfq = await this.findOneRfq(id, ctx)

    rfq.status = dto.status
    const saved = await this.rfqRepository.saveRfq(rfq)
    await this.cacheService.delCache(`rfq:list`, tenantId)
    await this.cacheService.delCache(`rfq:id:${id}`, tenantId)
    return saved
  }

  async submitQuotation(
    rfqId: string,
    dto: CreateQuotationDto,
    ctx: RequestContextDto,
  ): Promise<QuotationEntity> {
    this.logger.log(`Submitting quotation for RFQ ${rfqId}`)
    const tenantId = ctx.tenantId

    const rfq = await this.rfqRepository.findById(rfqId, tenantId)
    if (!rfq) {
      throw new NotFoundException('RFQ not found')
    }

    if (rfq.status !== RFQStatus.OPEN) {
      throw new BadRequestException('Quotations can only be submitted for OPEN RFQs')
    }

    const quotation = await this.quotationRepository.createAndSave(
      {
        rfqId,
        supplierId: dto.supplierId,
        totalAmount: dto.totalAmount,
        leadTimeDays: dto.leadTimeDays || 0,
        termsAndConditions: dto.termsAndConditions,
        status: QuotationStatus.PENDING,
      },
      ctx,
    )

    await this.cacheService.delCache(`rfq:id:${rfqId}`, tenantId)
    return quotation
  }

  async findQuotation(id: string, ctx: RequestContextDto): Promise<QuotationEntity> {
    const tenantId = ctx.tenantId
    const quotation = await this.quotationRepository.findById(id, tenantId)
    if (!quotation) {
      throw new NotFoundException('Quotation not found')
    }
    return quotation
  }

  async awardQuotation(id: string, ctx: RequestContextDto) {
    this.logger.log(`Awarding Quotation: ${id}`)
    const tenantId = ctx.tenantId

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const quotation = await this.quotationRepository.findById(id, tenantId, queryRunner.manager)
      if (!quotation) {
        throw new NotFoundException('Quotation not found')
      }

      const rfq = await this.rfqRepository.findByIdWithRelations(
        quotation.rfqId,
        tenantId,
        queryRunner.manager,
      )
      if (!rfq) {
        throw new NotFoundException('RFQ not found')
      }

      if (rfq.status !== RFQStatus.OPEN) {
        throw new BadRequestException('Can only award quotations for OPEN RFQs')
      }

      // Reject all other quotations, Accept this one
      for (const q of rfq.quotations) {
        if (q.id === quotation.id) {
          q.status = QuotationStatus.ACCEPTED
        } else {
          q.status = QuotationStatus.REJECTED
        }
        await queryRunner.manager.save(QuotationEntity, q)
      }

      rfq.status = RFQStatus.AWARDED
      await queryRunner.manager.save(RfqEntity, rfq)

      // Create Purchase Order based on this quotation
      const refNumber = `PO-RFQ-${rfq.rfqNumber}`
      const po = await this.purchaseOrderService.createPurchaseOrder(
        {
          supplierId: quotation.supplierId,
          referenceNumber: refNumber,
          items: rfq.purchaseRequisition
            ? rfq.purchaseRequisition.items?.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
                unitPrice:
                  Number(quotation.totalAmount) / (rfq.purchaseRequisition.items?.length || 1), // Simplification or estimation
              })) || []
            : [],
        } as any,
        ctx,
        queryRunner.manager,
      )

      await queryRunner.commitTransaction()

      await this.cacheService.delCache(`rfq:list`, tenantId)
      await this.cacheService.delCache(`rfq:id:${rfq.id}`, tenantId)

      return po
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
