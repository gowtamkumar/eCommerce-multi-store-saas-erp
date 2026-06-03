import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { AccountingOutboxService } from './services/accounting-outbox.service'
import { AccountingService } from './services/accounting.service'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'

@Processor('accounting')
export class AccountingProcessor extends WorkerHost {
  private readonly logger = new Logger(AccountingProcessor.name)

  constructor(
    private readonly accountingOutboxService: AccountingOutboxService,
    private readonly accountingService: AccountingService,
  ) {
    super()
  }

  async process(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`)
    const { payload, ctx } = job.data
    try {
      switch (job.name) {
        case 'process-accounting-outbox':
          this.logger.log('Starting execution of accounting outbox pending transactions sweep...')
          await this.accountingOutboxService.processPending()
          return { success: true }

        case 'post-payroll-accrual': {
          const { batchId, name, period, totalSalary, totalTaxesWithheld, totalDeductions, totalAmount } = payload
          this.logger.log(`Posting Payroll Accrual for batch: ${batchId}`)
          await this.accountingService.createJournalEntry(
            {
              type: JournalType.GENERAL,
              description: `Salary Accrual for Period ${period}: ${name}`,
              referenceType: 'PAYROLL_BATCH',
              referenceId: batchId,
              lines: [
                {
                  accountCode: '6000',
                  side: LedgerEntrySide.DEBIT,
                  amount: totalSalary,
                },
                {
                  accountCode: '2100',
                  side: LedgerEntrySide.CREDIT,
                  amount: totalAmount,
                },
                {
                  accountCode: '2200',
                  side: LedgerEntrySide.CREDIT,
                  amount: totalTaxesWithheld,
                },
                {
                  accountCode: '2100',
                  side: LedgerEntrySide.CREDIT,
                  amount: totalDeductions,
                },
              ].filter((line) => line.amount > 0),
            },
            ctx,
          )
          this.logger.log(`Successfully posted Salary Accrual GL entries for batch ${batchId}`)
          return { success: true }
        }

        case 'post-payroll-settlement': {
          const { batchId, name, totalAmount } = payload
          this.logger.log(`Posting Payroll Settlement for batch: ${batchId}`)
          await this.accountingService.createJournalEntry(
            {
              type: JournalType.GENERAL,
              description: `Payment Settlement for Payroll Batch: ${name}`,
              referenceType: 'PAYROLL_PAYMENT',
              referenceId: batchId,
              lines: [
                { accountCode: '2100', side: LedgerEntrySide.DEBIT, amount: totalAmount },
                { accountCode: '1000', side: LedgerEntrySide.CREDIT, amount: totalAmount },
              ],
            },
            ctx,
          )
          this.logger.log(`Successfully posted Payment Settlement GL entries for batch ${batchId}`)
          return { success: true }
        }

        case 'post-order-credit-placed': {
          const { orderId, walletDeduction, remainingAmount, netRevenue, taxAmount } = payload
          this.logger.log(`Posting B2B Credit Sale entries for order: ${orderId}`)
          const lines = []
          if (walletDeduction > 0) {
            lines.push({ accountCode: '2300', side: LedgerEntrySide.DEBIT, amount: walletDeduction })
          }
          if (remainingAmount > 0) {
            lines.push({ accountCode: '1200', side: LedgerEntrySide.DEBIT, amount: remainingAmount })
          }
          if (netRevenue > 0) {
            lines.push({ accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: netRevenue })
          }
          if (taxAmount > 0) {
            lines.push({ accountCode: '2200', side: LedgerEntrySide.CREDIT, amount: taxAmount })
          }

          await this.accountingService.createJournalEntry(
            {
              type: JournalType.SALES,
              description: `B2B Credit Sale - Net 30 Terms - Order ID: ${orderId}`,
              referenceType: 'ORDER',
              referenceId: orderId,
              lines,
            },
            ctx,
          )
          this.logger.log(`Successfully posted B2B Credit Sale GL entries for order ${orderId}`)
          return { success: true }
        }

        case 'post-order-paid': {
          const { orderId, paymentMethod, walletDeduction, remainingAmount, netRevenue, taxAmount } = payload
          this.logger.log(`Posting Sales Recognition entries for order: ${orderId}`)
          if (paymentMethod === 'ON_ACCOUNT') {
            return { success: true, skipped: true }
          }

          const lines = []
          if (walletDeduction > 0) {
            lines.push({
              accountCode: '2300',
              side: LedgerEntrySide.DEBIT,
              amount: walletDeduction,
            })
          }
          if (remainingAmount > 0) {
            lines.push({
              accountCode: '1000',
              side: LedgerEntrySide.DEBIT,
              amount: remainingAmount,
            })
          }
          if (netRevenue > 0) {
            lines.push({ accountCode: '4000', side: LedgerEntrySide.CREDIT, amount: netRevenue })
          }
          if (taxAmount > 0) {
            lines.push({ accountCode: '2200', side: LedgerEntrySide.CREDIT, amount: taxAmount })
          }

          await this.accountingService.createJournalEntry(
            {
              type: JournalType.SALES,
              description: `Sales Revenue & Cash Recognition - Order ID: ${orderId}`,
              referenceType: 'ORDER',
              referenceId: orderId,
              lines,
            },
            ctx,
          )
          this.logger.log(`Successfully posted Sales Cash Recognition GL entries for order ${orderId}`)
          return { success: true }
        }

        default:
          this.logger.warn(`Unknown job name: ${job.name}`)
      }
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`, error.stack)
      throw error
    }
  }
}
