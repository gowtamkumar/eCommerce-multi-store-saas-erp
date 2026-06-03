import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { AccountingOutboxService } from './services/accounting-outbox.service'

@Processor('accounting')
export class AccountingProcessor extends WorkerHost {
  private readonly logger = new Logger(AccountingProcessor.name)

  constructor(
    private readonly accountingOutboxService: AccountingOutboxService,
  ) {
    super()
  }

  async process(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`)
    try {
      switch (job.name) {
        case 'process-accounting-outbox':
          this.logger.log('Starting execution of accounting outbox pending transactions sweep...')
          await this.accountingOutboxService.processPending()
          return { success: true }
        default:
          this.logger.warn(`Unknown job name: ${job.name}`)
      }
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`, error.stack)
      throw error
    }
  }
}
