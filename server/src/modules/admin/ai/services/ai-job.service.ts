import { AiJobStatus } from '@/common/enums/ai-job-status.enum'
import { AiJobType } from '@/common/enums/ai-job-type.enum'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { AiJobEntity } from '../entities/ai-job.entity'
import {
  AiAutomationDispatchPayload,
  CartAbandonedEvent,
  ProductCreatedEvent,
} from '@/common/events/ai-domain.events'
import { GenerateInvoiceOcrDto } from '../dto/generate-invoice-ocr.dto'
import { AiJobRepository } from '../repositories/ai-job.repository'

export interface AiJobResponseDto {
  id: string
  storeId: string
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
    private readonly jobRepo: AiJobRepository,
    @InjectQueue('ai') private readonly aiQueue: Queue,
  ) {}

  toResponse(job: AiJobEntity): AiJobResponseDto {
    return {
      id: job.id,
      storeId: job.storeId,
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

  async findByIdForStore(jobId: string, storeId: string): Promise<AiJobEntity> {
    const job = await this.jobRepo.findOne({ where: { id: jobId, storeId } })
    if (!job) {
      throw new NotFoundException('AI job not found')
    }
    return job
  }

  async createAndEnqueue(
    storeId: string,
    type: AiJobType,
    payload: Record<string, unknown> = {},
  ): Promise<AiJobEntity> {
    const job = await this.jobRepo.save(
      this.jobRepo.create({
        storeId,
        type,
        status: AiJobStatus.QUEUED,
        payload,
      }),
    )

    const bullJob = await this.aiQueue.add(
      type,
      { jobId: job.id, storeId, payload },
      { jobId: job.id },
    )

    job.bullJobId = String(bullJob.id)
    return this.jobRepo.save(job)
  }

  async enqueueEmbeddingReindex(storeId: string): Promise<AiJobEntity> {
    return this.createAndEnqueue(storeId, AiJobType.EMBEDDING_REINDEX, {})
  }

  async enqueueEmbeddingBatch(storeId: string, productIds: string[]): Promise<AiJobEntity | null> {
    const uniqueIds = [...new Set(productIds.filter(Boolean))]
    if (uniqueIds.length === 0) {
      return null
    }

    return this.createAndEnqueue(storeId, AiJobType.EMBEDDING_BATCH, { productIds: uniqueIds })
  }

  async enqueueProductSeoDraft(storeId: string, productId: string): Promise<AiJobEntity> {
    return this.createAndEnqueue(storeId, AiJobType.BULK_SEO, {
      productId,
      draftOnly: true,
    })
  }

  async enqueueBulkDescriptionImport(
    storeId: string,
    payload: { importBatchId: string; productIds: string[] },
  ): Promise<AiJobEntity> {
    return this.createAndEnqueue(storeId, AiJobType.BULK_DESCRIPTION_IMPORT, {
      importBatchId: payload.importBatchId,
      productIds: [...new Set(payload.productIds.filter(Boolean))],
      applyToProducts: true,
    })
  }

  async enqueueCartAbandonedDraft(
    storeId: string,
    event: CartAbandonedEvent,
  ): Promise<AiJobEntity> {
    return this.createAndEnqueue(storeId, AiJobType.CART_ABANDONED_DRAFT, { ...event })
  }

  async enqueueInvoiceOcr(
    storeId: string,
    dto: GenerateInvoiceOcrDto,
  ): Promise<AiJobEntity> {
    return this.createAndEnqueue(storeId, AiJobType.OCR, { ...dto })
  }

  async enqueueDemandForecast(storeId: string): Promise<AiJobEntity> {
    return this.createAndEnqueue(storeId, AiJobType.DEMAND_FORECAST, { scheduled: 'weekly' })
  }

  async enqueueAutomationDispatch(
    storeId: string,
    payload: AiAutomationDispatchPayload,
  ): Promise<AiJobEntity> {
    return this.createAndEnqueue(storeId, AiJobType.AUTOMATION_DISPATCH, { ...payload })
  }

  async enqueueProductCreatedAutomation(
    storeId: string,
    event: Omit<ProductCreatedEvent, 'storeId'>,
  ): Promise<AiJobEntity> {
    return this.enqueueAutomationDispatch(storeId, {
      eventType: 'product.created',
      productId: event.productId,
      productName: event.productName,
      category: event.category,
      hasSeoFields: event.hasSeoFields,
    })
  }

  async enqueueCartAbandonedAutomation(
    storeId: string,
    event: Omit<CartAbandonedEvent, 'storeId'>,
  ): Promise<AiJobEntity> {
    return this.enqueueAutomationDispatch(storeId, {
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
    storeId: string,
    type: AiJobType,
    payloadKey: string,
    payloadValue: string,
    withinHours: number,
  ): Promise<boolean> {
    const since = new Date(Date.now() - withinHours * 60 * 60 * 1000)

    const count = await this.jobRepo
      .createQueryBuilder('job')
      .where('job.store_id = :storeId', { storeId })
      .andWhere('job.type = :type', { type })
      .andWhere('job.created_at >= :since', { since })
      .andWhere(`job.payload ->> :payloadKey = :payloadValue`, { payloadKey, payloadValue })
      .andWhere('job.status IN (:...statuses)', {
        statuses: [AiJobStatus.QUEUED, AiJobStatus.RUNNING, AiJobStatus.COMPLETED],
      })
      .getCount()

    return count > 0
  }

  async hasRecentCartAbandonedAutomation(
    storeId: string,
    cartId: string,
    withinHours: number,
  ): Promise<boolean> {
    const since = new Date(Date.now() - withinHours * 60 * 60 * 1000)

    const count = await this.jobRepo
      .createQueryBuilder('job')
      .where('job.store_id = :storeId', { storeId })
      .andWhere('job.created_at >= :since', { since })
      .andWhere(`job.payload ->> 'cartId' = :cartId`, { cartId })
      .andWhere('job.type IN (:...types)', {
        types: [AiJobType.CART_ABANDONED_DRAFT, AiJobType.AUTOMATION_DISPATCH],
      })
      .andWhere('job.status IN (:...statuses)', {
        statuses: [AiJobStatus.QUEUED, AiJobStatus.RUNNING, AiJobStatus.COMPLETED],
      })
      .getCount()

    return count > 0
  }

  async findCompletedCartIdsWithDrafts(
    storeId: string,
    cartIds: string[],
  ): Promise<Set<string>> {
    const uniqueIds = [...new Set(cartIds.filter(Boolean))]
    if (uniqueIds.length === 0) {
      return new Set()
    }

    const rows = await this.jobRepo
      .createQueryBuilder('job')
      .select(`job.payload ->> 'cartId'`, 'cartId')
      .where('job.store_id = :storeId', { storeId })
      .andWhere('job.type = :type', { type: AiJobType.CART_ABANDONED_DRAFT })
      .andWhere('job.status = :status', { status: AiJobStatus.COMPLETED })
      .andWhere(`job.payload ->> 'cartId' IN (:...cartIds)`, { cartIds: uniqueIds })
      .getRawMany<{ cartId: string | null }>()

    return new Set(rows.map((row) => row.cartId).filter((id): id is string => Boolean(id)))
  }

  async findLatestByPayload(
    storeId: string,
    type: AiJobType,
    payloadKey: string,
    payloadValue: string,
  ): Promise<AiJobEntity | null> {
    return this.jobRepo
      .createQueryBuilder('job')
      .where('job.store_id = :storeId', { storeId })
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
