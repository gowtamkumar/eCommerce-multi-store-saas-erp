import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { EventBusService } from '@/common/event-bus/event-bus.service'
import { AccountingService } from './services/accounting.service'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'
import {
  PAYROLL_ACCRUED_EVENT,
  PAYROLL_PAID_EVENT,
  PayrollAccruedEventPayload,
  PayrollPaidEventPayload,
} from '@/common/event-bus/events/payroll.events'
import {
  ORDER_CREDIT_PLACED_EVENT,
  ORDER_PAID_EVENT,
  OrderCreditPlacedEventPayload,
  OrderPaidEventPayload,
} from '@/common/event-bus/events/order.events'

@Injectable()
export class AccountingEventSubscriber implements OnModuleInit {
  private readonly logger = new Logger(AccountingEventSubscriber.name)

  constructor(
    private readonly eventBus: EventBusService,
    private readonly accountingService: AccountingService,
  ) {}

  onModuleInit() {
    this.logger.log('Registering Accounting Event Subscribers...')

    // 1. Subscribe to PAYROLL_ACCRUED_EVENT
    this.eventBus.ofEvent<PayrollAccruedEventPayload>(PAYROLL_ACCRUED_EVENT).subscribe({
      next: async (event) => {
        this.logger.log(`Handling Payroll Accrued Event for batch: ${event.payload.batchId}`)
        const { batchId, name, period, totalSalary, totalTaxesWithheld, totalDeductions, totalAmount } = event.payload
        try {
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
            event.ctx,
          )
          this.logger.log(`Successfully posted Salary Accrual GL entries for batch ${batchId}`)
        } catch (error: any) {
          this.logger.error(
            `Failed to post accrual accounting entries for payroll batch ${batchId} via event: ${error.message}`,
          )
        }
      },
    })

    // 2. Subscribe to PAYROLL_PAID_EVENT
    this.eventBus.ofEvent<PayrollPaidEventPayload>(PAYROLL_PAID_EVENT).subscribe({
      next: async (event) => {
        this.logger.log(`Handling Payroll Paid Event for batch: ${event.payload.batchId}`)
        const { batchId, name, totalAmount } = event.payload
        try {
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
            event.ctx,
          )
          this.logger.log(`Successfully posted Payment Settlement GL entries for batch ${batchId}`)
        } catch (error: any) {
          this.logger.error(
            `Failed to post payment journal entries for batch ${batchId} via event: ${error.message}`,
          )
        }
      },
    })

    // 3. Subscribe to ORDER_CREDIT_PLACED_EVENT
    this.eventBus.ofEvent<OrderCreditPlacedEventPayload>(ORDER_CREDIT_PLACED_EVENT).subscribe({
      next: async (event) => {
        this.logger.log(`Handling Order Credit Placed Event for order: ${event.payload.orderId}`)
        const { orderId, walletDeduction, remainingAmount, netRevenue, taxAmount } = event.payload
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

        try {
          await this.accountingService.createJournalEntry(
            {
              type: JournalType.SALES,
              description: `B2B Credit Sale - Net 30 Terms - Order ID: ${orderId}`,
              referenceType: 'ORDER',
              referenceId: orderId,
              lines,
            },
            event.ctx,
          )
          this.logger.log(`Successfully posted B2B Credit Sale GL entries for order ${orderId}`)
        } catch (error: any) {
          this.logger.error(
            `Failed to post credit sale journal entries for order ${orderId} via event: ${error.message}`,
          )
        }
      },
    })

    // 4. Subscribe to ORDER_PAID_EVENT
    this.eventBus.ofEvent<OrderPaidEventPayload>(ORDER_PAID_EVENT).subscribe({
      next: async (event) => {
        this.logger.log(`Handling Order Paid Event for order: ${event.payload.orderId}`)
        const { orderId, paymentMethod, walletDeduction, remainingAmount, netRevenue, taxAmount } = event.payload
        if (paymentMethod === 'ON_ACCOUNT') {
          // B2B credit payments are handled directly via AR Service transaction postings in OrderService
          return
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

        try {
          await this.accountingService.createJournalEntry(
            {
              type: JournalType.SALES,
              description: `Sales Revenue & Cash Recognition - Order ID: ${orderId}`,
              referenceType: 'ORDER',
              referenceId: orderId,
              lines,
            },
            event.ctx,
          )
          this.logger.log(`Successfully posted Sales Cash Recognition GL entries for order ${orderId}`)
        } catch (error: any) {
          this.logger.error(
            `Failed to post sales recognition journal entries for order ${orderId} via event: ${error.message}`,
          )
        }
      },
    })
  }
}
