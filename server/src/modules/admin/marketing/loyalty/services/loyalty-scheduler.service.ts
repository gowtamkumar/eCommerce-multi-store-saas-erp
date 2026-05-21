import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

@Injectable()
export class LoyaltySchedulerService implements OnModuleInit {
  private readonly logger = new Logger(LoyaltySchedulerService.name)

  constructor(@InjectQueue('loyalty') private readonly loyaltyQueue: Queue) {}

  async onModuleInit() {
    this.logger.log('Initializing Loyalty Tiers Assessment Repeatable Scheduler...')
    try {
      // Clean up previous jobs with the same name if any config changed, or simply add the repeatable job
      // We run it every night at midnight: cron '0 0 * * *'
      // For local testing & robustness, we use a daily cron.
      await this.loyaltyQueue.add(
        'assess-tiers',
        {},
        {
          repeat: {
            pattern: '0 0 * * *', // Midnight daily
          },
          jobId: 'assess-tiers-repeatable',
        },
      )
      this.logger.log('Successfully registered repeatable job "assess-tiers" (0 0 * * *)')
    } catch (err) {
      this.logger.error('Failed to schedule repeatable job "assess-tiers":', err)
    }
  }
}
