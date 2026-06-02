import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

@Injectable()
export class StockReservationSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(StockReservationSchedulerService.name)

  constructor(@InjectQueue('order') private readonly orderQueue: Queue) {}

  async onModuleInit() {
    this.logger.log('Initializing Stock Reservations Expiry Repeatable Scheduler...')
    try {
      // Setup repeatable cron job to sweep expired reservations every minute
      await this.orderQueue.add(
        'sweep-expired-reservations',
        {},
        {
          repeat: {
            pattern: '* * * * *', // Run every minute
          },
          jobId: 'sweep-expired-reservations-repeatable',
        },
      )
      this.logger.log(
        'Successfully registered repeatable job "sweep-expired-reservations" (* * * * *)',
      )

      // Setup repeatable cron job to process accounting outbox every minute
      await this.orderQueue.add(
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

      // Sweep expired product batches and write off residual stock once a day.
      // Runs at 02:00 server time — outside business hours.
      await this.orderQueue.add(
        'sweep-expired-batches',
        {},
        {
          repeat: { pattern: '0 2 * * *' },
          jobId: 'sweep-expired-batches-repeatable',
        },
      )
      this.logger.log('Successfully registered repeatable job "sweep-expired-batches" (0 2 * * *)')
    } catch (err) {
      this.logger.error('Failed to schedule repeatable jobs:', err)
    }
  }
}
