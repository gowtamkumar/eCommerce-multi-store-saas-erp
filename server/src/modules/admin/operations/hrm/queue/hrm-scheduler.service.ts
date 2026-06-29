import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { Queue } from 'bullmq'

@Injectable()
export class HrmSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(HrmSchedulerService.name)

  constructor(@InjectQueue('hrm') private readonly hrmQueue: Queue) {}

  async onModuleInit() {
    this.logger.log('Registering HRM repeatable jobs...')

    const jobs = [
      {
        name: 'probation-auto-confirm',
        pattern: '0 1 * * *', // 01:00 daily
        jobId: 'hrm-probation-auto-confirm',
      },
      {
        name: 'document-expiry-alerts',
        pattern: '0 8 * * *', // 08:00 daily
        jobId: 'hrm-document-expiry-alerts',
      },
      {
        name: 'auto-check-out',
        pattern: '30 23 * * *', // 23:30 daily
        jobId: 'hrm-auto-check-out',
      },
    ]

    for (const job of jobs) {
      try {
        await this.hrmQueue.add(
          job.name,
          {},
          {
            repeat: { pattern: job.pattern },
            jobId: job.jobId,
          },
        )
        this.logger.log(`Registered repeatable job "${job.name}" (${job.pattern})`)
      } catch (err: any) {
        this.logger.error(`Failed to register job "${job.name}": ${err.message}`)
      }
    }
  }
}
