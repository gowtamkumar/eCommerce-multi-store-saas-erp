import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

@Injectable()
export class AccountingSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(AccountingSchedulerService.name)

  constructor(@InjectQueue('accounting') private readonly accountingQueue: Queue) {}

  async onModuleInit() {
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
}
