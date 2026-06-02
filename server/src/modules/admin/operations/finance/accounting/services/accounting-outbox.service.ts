import { Injectable, Logger } from '@nestjs/common'
import { DataSource, EntityManager, LessThan } from 'typeorm'
import { AccountingOutboxEntity } from '../entities/accounting-outbox.entity'
import { AccountingService } from './accounting.service'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'

@Injectable()
export class AccountingOutboxService {
  private readonly logger = new Logger(AccountingOutboxService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly accountingService: AccountingService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Enqueues a journal entry creation request to the outbox.
   */
  async enqueueJournalEntry(
    data: any,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<AccountingOutboxEntity> {
    const em = manager || this.dataSource.manager
    const tenantId = ctx.tenantId

    const payload = {
      journalEntry: data,
      context: {
        tenantId,
        userId: ctx.userId,
      },
    }

    const outbox = em.create(AccountingOutboxEntity, {
      tenantId,
      event: 'CREATE_JOURNAL_ENTRY',
      payload,
      status: 'PENDING',
      attempts: 0,
    })

    return em.save(AccountingOutboxEntity, outbox)
  }

  /**
   * Processes pending and eligible failed entries in the outbox.
   */
  async processPending(limit: number = 50): Promise<void> {
    const em = this.dataSource.manager

    // Find entries that are PENDING, or FAILED but have remaining attempts
    const entries = await em.find(AccountingOutboxEntity, {
      where: [{ status: 'PENDING' }, { status: 'FAILED', attempts: LessThan(3) }],
      order: { createdAt: 'ASC' },
      take: limit,
    })

    if (entries.length === 0) {
      return
    }

    this.logger.log(`Processing ${entries.length} pending accounting outbox entries`)

    for (const entry of entries) {
      try {
        await this.dataSource.transaction(async (transactionManager) => {
          // Lock row to prevent concurrent worker execution
          const outbox = await transactionManager.findOne(AccountingOutboxEntity, {
            where: { id: entry.id },
            lock: { mode: 'pessimistic_write' },
          })

          if (!outbox || outbox.status === 'PROCESSED') {
            return
          }

          outbox.attempts += 1

          try {
            const { journalEntry, context } = outbox.payload
            const ctx = new RequestContextDto()
            ctx.tenantId = outbox.tenantId || context?.tenantId
            ctx.userId = context?.userId

            // Post to General Ledger synchronously within this transaction
            await this.accountingService.createJournalEntry(journalEntry, ctx, transactionManager)

            outbox.status = 'PROCESSED'
            outbox.processedAt = new Date()
            outbox.error = null
          } catch (err: any) {
            outbox.status = 'FAILED'
            outbox.error = err.message || String(err)
            this.logger.error(
              `Failed to process accounting outbox entry ${outbox.id}: ${outbox.error}`,
              err.stack,
            )

            // Trigger system alert notification for admins on final fail (reached 3 attempts)
            if (outbox.attempts >= 3) {
              try {
                await this.notificationService.createNotification(
                  {
                    title: 'Accounting Outbox Processing Failed',
                    message: `Journal entry outbox ID ${outbox.id} failed after maximum retry attempts. Error: ${outbox.error}`,
                    type: 'DANGER',
                    link: '/admin/finance/accounting',
                    userId: null as any, // tenant-wide notification
                  },
                  outbox.tenantId,
                )
              } catch (notifErr: any) {
                this.logger.error(
                  `Failed to trigger outbox error notification: ${notifErr.message}`,
                )
              }
            }
          }

          await transactionManager.save(AccountingOutboxEntity, outbox)
        })
      } catch (transactionErr) {
        this.logger.error(
          `Transaction error while processing outbox entry ${entry.id}`,
          transactionErr,
        )
      }
    }
  }
}
