import { AiJobType } from '@/common/enums/ai-job-type.enum'
import { ProductEmbeddingService } from '@/modules/admin/catalog/product/services/product-embedding.service'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { AiAutomationService } from '../services/ai-automation.service'
import { AiJobService } from '../services/ai-job.service'

interface AiQueuePayload {
  jobId: string
  tenantId: string
  payload?: Record<string, unknown>
}

@Processor('ai')
@Injectable()
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name)

  constructor(
    private readonly aiJobService: AiJobService,
    private readonly productEmbeddingService: ProductEmbeddingService,
    private readonly aiAutomationService: AiAutomationService,
  ) {
    super()
  }

  async process(job: Job<AiQueuePayload>) {
    const { jobId, tenantId } = job.data
    const payload = job.data.payload ?? {}
    this.logger.log(`Processing AI job ${jobId} (${job.name}) for tenant ${tenantId}`)

    await this.aiJobService.markRunning(jobId)

    try {
      switch (job.name) {
        case AiJobType.EMBEDDING_REINDEX: {
          const result = await this.productEmbeddingService.reindexTenantCatalog(tenantId)
          await this.aiJobService.markCompleted(jobId, result)
          return result
        }

        case AiJobType.EMBEDDING_BATCH: {
          const productIds = (payload.productIds as string[] | undefined) ?? []
          const result = await this.productEmbeddingService.syncProductEmbeddings(tenantId, productIds)
          await this.aiJobService.markCompleted(jobId, result)
          return result
        }

        case AiJobType.BULK_SEO: {
          const productId = String(payload.productId ?? '')
          const result = await this.aiAutomationService.runProductSeoDraftJob(tenantId, productId)
          await this.aiJobService.markCompleted(jobId, result)
          return result
        }

        case AiJobType.CART_ABANDONED_DRAFT: {
          const result = await this.aiAutomationService.runCartAbandonedDraftJob(tenantId, payload)
          await this.aiJobService.markCompleted(jobId, result)
          return result
        }

        case AiJobType.OCR: {
          const result = await this.aiAutomationService.runInvoiceOcrJob(tenantId, payload)
          await this.aiJobService.markCompleted(jobId, result)
          return result
        }

        case AiJobType.DEMAND_FORECAST: {
          const result = await this.aiAutomationService.runDemandForecastJob(tenantId)
          await this.aiJobService.markCompleted(jobId, result)
          return result
        }

        case AiJobType.AUTOMATION_DISPATCH: {
          const result = await this.aiAutomationService.dispatchAutomationEvent(tenantId, payload)
          await this.aiJobService.markCompleted(jobId, result)
          return result
        }

        default:
          throw new Error(`Unknown AI job type: ${job.name}`)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'AI job failed'
      this.logger.error(`AI job ${jobId} failed: ${message}`)
      await this.aiJobService.markFailed(jobId, message)
      throw error
    }
  }
}
