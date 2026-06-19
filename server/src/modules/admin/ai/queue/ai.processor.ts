import { AiJobType } from '@/common/enums/ai-job-type.enum'
import { ProductEmbeddingService } from '@/modules/admin/catalog/product/services/product-embedding.service'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { Job } from 'bullmq'
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
  ) {
    super()
  }

  async process(job: Job<AiQueuePayload>) {
    const { jobId, tenantId } = job.data
    this.logger.log(`Processing AI job ${jobId} (${job.name}) for tenant ${tenantId}`)

    await this.aiJobService.markRunning(jobId)

    try {
      switch (job.name) {
        case AiJobType.EMBEDDING_REINDEX: {
          const result = await this.productEmbeddingService.reindexTenantCatalog(tenantId)
          await this.aiJobService.markCompleted(jobId, result)
          return result
        }

        case AiJobType.EMBEDDING_BATCH:
        case AiJobType.OCR:
        case AiJobType.BULK_SEO:
          throw new Error(`AI job type "${job.name}" is not implemented yet`)

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
