import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

@Injectable()
export class AccountingSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(AccountingSchedulerService.name)

  constructor(@InjectQueue('accounting') private readonly accountingQueue: Queue) {}

  async onModuleInit() {
    const isProduction = process.env.NODE_ENV === 'production'

    if (!isProduction) {
      this.logger.log(
        'Skipping accounting outbox repeatable job in development (set NODE_ENV=production to enable)',
      )
      await this.clearRepeatableOutboxJob()
      return
    }

    this.logger.log('Initializing Accounting Repeatable Scheduler...')
    try {
      await this.accountingQueue.add(
        'process-accounting-outbox',
        {},
        {
          repeat: {
            pattern: '* * * * *', // Run every minute
          },
          jobId: 'process-accounting-outbox-repeatable',
        },
      )
      this.logger.log(
        'Successfully registered repeatable job "process-accounting-outbox" (* * * * *)',
      )
    } catch (err) {
      this.logger.error('Failed to schedule repeatable jobs:', err)
    }
  }

  /** Remove stale repeatable outbox job left in Redis from a previous boot. */
  private async clearRepeatableOutboxJob() {
    try {
      const jobs = await this.accountingQueue.getRepeatableJobs()
      for (const job of jobs) {
        if (job.name === 'process-accounting-outbox') {
          await this.accountingQueue.removeRepeatableByKey(job.key)
          this.logger.log(`Removed repeatable job "${job.name}" from development queue`)
        }
      }
    } catch (err) {
      this.logger.warn('Failed to clear development repeatable outbox job', err)
    }
  }
}
