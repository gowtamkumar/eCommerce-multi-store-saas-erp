import { AiJobStatus } from '@/common/enums/ai-job-status.enum'
import { AiJobType } from '@/common/enums/ai-job-type.enum'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { InjectRepository } from '@nestjs/typeorm'
import { Queue } from 'bullmq'
import { Repository } from 'typeorm'
import { AiJobEntity } from '../entities/ai-job.entity'
import {
  AiAutomationDispatchPayload,
  CartAbandonedEvent,
  ProductCreatedEvent,
} from '@/common/events/ai-domain.events'
import { GenerateInvoiceOcrDto } from '../dto/generate-invoice-ocr.dto'

export interface AiJobResponseDto {
  id: string
  tenantId: string
  type: AiJobType
  status: AiJobStatus
  payload: Record<string, unknown> | null
  result: Record<string, unknown> | null
  error: string | null
  totalTokens: number
  createdAt: Date
  startedAt: Date | null
  completedAt: Date | null
}

@Injectable()
export class AiJobService {
  constructor(
    @InjectRepository(AiJobEntity)
    private readonly jobRepo: Repository<AiJobEntity>,
    @InjectQueue('ai') private readonly aiQueue: Queue,
  ) {}

  toResponse(job: AiJobEntity): AiJobResponseDto {
    return {
      id: job.id,
      tenantId: job.tenantId,
      type: job.type,
      status: job.status,
      payload: job.payload,
      result: job.result,
      error: job.error,
      totalTokens: job.totalTokens,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    }
  }

  async findByIdForTenant(jobId: string, tenantId: string): Promise<AiJobEntity> {
    const job = await this.jobRepo.findOne({ where: { id: jobId, tenantId } })
    if (!job) {
      throw new NotFoundException('AI job not found')
    }
    return job
  }

  async createAndEnqueue(
    tenantId: string,
    type: AiJobType,
    payload: Record<string, unknown> = {},
  ): Promise<AiJobEntity> {
    const job = await this.jobRepo.save(
      this.jobRepo.create({
        tenantId,
        type,
        status: AiJobStatus.QUEUED,
        payload,
      }),
    )

    const bullJob = await this.aiQueue.add(
      type,
      { jobId: job.id, tenantId, payload },
      { jobId: job.id },
    )

    job.bullJobId = String(bullJob.id)
    return this.jobRepo.save(job)
  }

  async enqueueEmbeddingReindex(tenantId: string): Promise<AiJobEntity> {
    return this.createAndEnqueue(tenantId, AiJobType.EMBEDDING_REINDEX, {})
  }

  async enqueueEmbeddingBatch(tenantId: string, productIds: string[]): Promise<AiJobEntity | null> {
    const uniqueIds = [...new Set(productIds.filter(Boolean))]
    if (uniqueIds.length === 0) {
      return null
    }

    return this.createAndEnqueue(tenantId, AiJobType.EMBEDDING_BATCH, { productIds: uniqueIds })
  }

  async enqueueProductSeoDraft(tenantId: string, productId: string): Promise<AiJobEntity> {
    return this.createAndEnqueue(tenantId, AiJobType.BULK_SEO, {
      productId,
      draftOnly: true,
    })
  }

  async enqueueCartAbandonedDraft(
    tenantId: string,
    event: CartAbandonedEvent,
  ): Promise<AiJobEntity> {
    return this.createAndEnqueue(tenantId, AiJobType.CART_ABANDONED_DRAFT, { ...event })
  }

  async enqueueInvoiceOcr(
    tenantId: string,
    dto: GenerateInvoiceOcrDto,
  ): Promise<AiJobEntity> {
    return this.createAndEnqueue(tenantId, AiJobType.OCR, { ...dto })
  }

  async enqueueDemandForecast(tenantId: string): Promise<AiJobEntity> {
    return this.createAndEnqueue(tenantId, AiJobType.DEMAND_FORECAST, { scheduled: 'weekly' })
  }

  async enqueueAutomationDispatch(
    tenantId: string,
    payload: AiAutomationDispatchPayload,
  ): Promise<AiJobEntity> {
    return this.createAndEnqueue(tenantId, AiJobType.AUTOMATION_DISPATCH, { ...payload })
  }

  async enqueueProductCreatedAutomation(
    tenantId: string,
    event: Omit<ProductCreatedEvent, 'tenantId'>,
  ): Promise<AiJobEntity> {
    return this.enqueueAutomationDispatch(tenantId, {
      eventType: 'product.created',
      productId: event.productId,
      productName: event.productName,
      category: event.category,
      hasSeoFields: event.hasSeoFields,
    })
  }

  async enqueueCartAbandonedAutomation(
    tenantId: string,
    event: Omit<CartAbandonedEvent, 'tenantId'>,
  ): Promise<AiJobEntity> {
    return this.enqueueAutomationDispatch(tenantId, {
      eventType: 'cart.abandoned',
      cartId: event.cartId,
      customerName: event.customerName,
      customerEmail: event.customerEmail,
      customerPhone: event.customerPhone,
      cartSummary: event.cartSummary,
      messageTemplate: event.messageTemplate,
      hoursSinceUpdate: event.hoursSinceUpdate,
    })
  }

  async hasRecentPayloadJob(
    tenantId: string,
    type: AiJobType,
    payloadKey: string,
    payloadValue: string,
    withinHours: number,
  ): Promise<boolean> {
    const since = new Date(Date.now() - withinHours * 60 * 60 * 1000)

    const count = await this.jobRepo
      .createQueryBuilder('job')
      .where('job.tenant_id = :tenantId', { tenantId })
      .andWhere('job.type = :type', { type })
      .andWhere('job.created_at >= :since', { since })
      .andWhere(`job.payload ->> :payloadKey = :payloadValue`, { payloadKey, payloadValue })
      .andWhere('job.status IN (:...statuses)', {
        statuses: [AiJobStatus.QUEUED, AiJobStatus.RUNNING, AiJobStatus.COMPLETED],
      })
      .getCount()

    return count > 0
  }

  async findLatestByPayload(
    tenantId: string,
    type: AiJobType,
    payloadKey: string,
    payloadValue: string,
  ): Promise<AiJobEntity | null> {
    return this.jobRepo
      .createQueryBuilder('job')
      .where('job.tenant_id = :tenantId', { tenantId })
      .andWhere('job.type = :type', { type })
      .andWhere(`job.payload ->> :payloadKey = :payloadValue`, { payloadKey, payloadValue })
      .andWhere('job.status = :status', { status: AiJobStatus.COMPLETED })
      .orderBy('job.completed_at', 'DESC')
      .getOne()
  }

  async markRunning(jobId: string): Promise<void> {
    await this.jobRepo.update(jobId, {
      status: AiJobStatus.RUNNING,
      startedAt: new Date(),
      error: null,
    })
  }

  async markCompleted(
    jobId: string,
    result: Record<string, unknown>,
    totalTokens = 0,
  ): Promise<void> {
    await this.jobRepo.update(jobId, {
      status: AiJobStatus.COMPLETED,
      result,
      totalTokens,
      completedAt: new Date(),
      error: null,
    })
  }

  async markFailed(jobId: string, error: string): Promise<void> {
    await this.jobRepo.update(jobId, {
      status: AiJobStatus.FAILED,
      error: error.slice(0, 4000),
      completedAt: new Date(),
    })
  }
}
