import { AiJobType } from '@/common/enums/ai-job-type.enum'
import { ProductEmbeddingService } from '@/modules/admin/catalog/product/services/product-embedding.service'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { AiAutomationService } from '../services/ai-automation.service'
import { AiJobService } from '../services/ai-job.service'

interface AiQueuePayload {
  jobId: string
  storeId: string
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
    const { jobId, storeId } = job.data
    const payload = job.data.payload ?? {}
    this.logger.log(`Processing AI job ${jobId} (${job.name}) for store ${storeId}`)

    await this.aiJobService.markRunning(jobId)

    try {
      switch (job.name) {
        case AiJobType.EMBEDDING_REINDEX: {
          const result = await this.productEmbeddingService.reindexStoreCatalog(storeId)
          await this.aiJobService.markCompleted(jobId, result)
          return result
        }

        case AiJobType.EMBEDDING_BATCH: {
          const productIds = (payload.productIds as string[] | undefined) ?? []
          const result = await this.productEmbeddingService.syncProductEmbeddings(storeId, productIds)
          await this.aiJobService.markCompleted(jobId, result)
          return result
        }

        case AiJobType.BULK_SEO: {
          const productId = String(payload.productId ?? '')
          const result = await this.aiAutomationService.runProductSeoDraftJob(storeId, productId)
          await this.aiJobService.markCompleted(jobId, result)
          return result
        }

        case AiJobType.BULK_DESCRIPTION_IMPORT: {
          const result = await this.aiAutomationService.runBulkDescriptionImportJob(storeId, payload)
          await this.aiJobService.markCompleted(jobId, result)
          return result
        }

        case AiJobType.CART_ABANDONED_DRAFT: {
          const result = await this.aiAutomationService.runCartAbandonedDraftJob(storeId, payload)
          await this.aiJobService.markCompleted(jobId, result)
          return result
        }

        case AiJobType.OCR: {
          const result = await this.aiAutomationService.runInvoiceOcrJob(storeId, payload)
          await this.aiJobService.markCompleted(jobId, result)
          return result
        }

        case AiJobType.DEMAND_FORECAST: {
          const result = await this.aiAutomationService.runDemandForecastJob(storeId)
          await this.aiJobService.markCompleted(jobId, result)
          return result
        }

        case AiJobType.AUTOMATION_DISPATCH: {
          const result = await this.aiAutomationService.dispatchAutomationEvent(storeId, payload)
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
