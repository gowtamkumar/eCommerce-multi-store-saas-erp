import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

@Injectable()
export class LoyaltySchedulerService implements OnModuleInit {
  private readonly logger = new Logger(LoyaltySchedulerService.name)

  constructor(@InjectQueue('loyalty') private readonly loyaltyQueue: Queue) {}

  async onModuleInit() {
    this.logger.log('Initializing Loyalty repeatable schedulers...')
    try {
      // Tier reassessment — midnight daily.
      await this.loyaltyQueue.add(
        'assess-tiers',
        {},
        {
          repeat: { pattern: '0 0 * * *' },
          jobId: 'assess-tiers-repeatable',
        },
      )
      this.logger.log('Registered repeatable "assess-tiers" (0 0 * * *)')

      // Points expiry sweep — 03:00 daily so it doesn't collide with the
      // tier job. Idempotent by virtue of the partial unique index on
      // (tenant, ref_type='EXPIRY', ref_id=batchId).
      await this.loyaltyQueue.add(
        'expire-points',
        {},
        {
          repeat: { pattern: '0 3 * * *' },
          jobId: 'expire-points-repeatable',
        },
      )
      this.logger.log('Registered repeatable "expire-points" (0 3 * * *)')
    } catch (err) {
      this.logger.error('Failed to schedule loyalty repeatable jobs:', err)
    }
  }
}
