import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { ArLedgerEntity } from '../entities/ar-ledger.entity'
import { ArTransactionType } from '@/common/enums/ar-transaction-type.enum'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { AccountingService } from './accounting.service'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'

@Injectable()
export class ArService {
  private readonly logger = new Logger(ArService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly accountingService: AccountingService,
  ) {}

  private async getStoreBaseCurrency(storeId: string, manager?: EntityManager): Promise<string> {
    const em = manager || this.dataSource.manager
    const settings = await em.findOne(SiteSettingsEntity, { where: { storeId } })
    return (settings?.currency || 'USD').toUpperCase()
  }

  /**
   * Sums all ledger amounts for a customer to find their current outstanding debt.
   */
  async getCustomerOutstandingBalance(
    customerId: string,
    storeId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const em = manager || this.dataSource.manager
    const result = await em
      .createQueryBuilder(ArLedgerEntity, 'ledger')
      .select('SUM(ledger.amount)', 'total')
      .where('ledger.customer_id = :customerId', { customerId })
      .andWhere('ledger.store_id = :storeId', { storeId })
      .getRawOne()

    return Number(result?.total || 0)
  }

  /**
   * Appends an entry to the customer's Accounts Receivable ledger.
   */
  async postArTransaction(
    data: {
      customerId: string
      type: ArTransactionType
      amount: number // Signed: positive for debt increase, negative for payments/reductions
      referenceType?: string
      referenceId?: string
      dueDate?: Date
      currency?: string
      createdBy?: string
    },
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<ArLedgerEntity> {
    const em = manager || this.dataSource.manager
    const storeId = ctx.storeId

    // Calculate balance after
    const currentBalance = await this.getCustomerOutstandingBalance(data.customerId, storeId, em)
    const balanceAfter = currentBalance + Number(data.amount)

    const ledgerEntry = em.create(ArLedgerEntity, {
      customerId: data.customerId,
      type: data.type,
      amount: Number(data.amount),
      balanceAfter,
      currency: data.currency || 'USD',
      dueDate: data.dueDate || null,
      referenceType: data.referenceType || null,
      referenceId: data.referenceId || null,
      storeId,
      createdBy: data.createdBy || ctx.userId || null,
    })

    return em.save(ArLedgerEntity, ledgerEntry)
  }

  /**
   * Records a customer payment, clearing outstanding AR debt.
   * Auto-posts double-entry ledger entries (Debit Cash 1000 / Credit AR 1200).
   */
  async recordCustomerPayment(
    data: {
      customerId: string
      amount: number
      paymentMethod: string
      transactionId: string
      remarks?: string
    },
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<ArLedgerEntity> {
    const storeId = ctx.storeId
    const amount = Number(data.amount)

    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero')
    }

    const queryRunner = manager ? null : this.dataSource.createQueryRunner()
    const em = manager || queryRunner.manager

    if (queryRunner) {
      await queryRunner.connect()
      await queryRunner.startTransaction()
    }

    try {
      // 1. Verify customer exists
      const customer = await em.findOne(UserEntity, { where: { id: data.customerId, storeId } })
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${data.customerId} not found`)
      }

      // 2. Post AR Ledger Entry (negative amount to reduce outstanding balance)
      const baseCurrency = await this.getStoreBaseCurrency(storeId, em)
      const ledgerEntry = await this.postArTransaction(
        {
          customerId: data.customerId,
          type: ArTransactionType.PAYMENT,
          amount: -amount,
          referenceType: 'PAYMENT_RECEIPT',
          referenceId: data.transactionId,
          currency: baseCurrency,
        },
        ctx,
        em,
      )

      // 3. Post Balanced Double-Entry Journal to General Ledger
      await this.accountingService.createJournalEntry(
        {
          type: JournalType.CASH_RECEIPT,
          description: data.remarks || `Customer Payment Received - Customer: ${customer.name}`,
          referenceType: 'AR_LEDGER',
          referenceId: ledgerEntry.id,
          lines: [
            { accountCode: '1000', side: LedgerEntrySide.DEBIT, amount }, // Debit Cash (increases Assets)
            { accountCode: '1200', side: LedgerEntrySide.CREDIT, amount }, // Credit Accounts Receivable (decreases Assets)
          ],
        },
        ctx,
        em,
      )

      if (queryRunner) await queryRunner.commitTransaction()
      return ledgerEntry
    } catch (err) {
      if (queryRunner) await queryRunner.rollbackTransaction()
      throw err
    } finally {
      if (queryRunner) await queryRunner.release()
    }
  }

  /**
   * Generates a B2B Accounts Receivable aging report using a FIFO allocation algorithm.
   */
  async getArAgingReport(ctx: RequestContextDto): Promise<any[]> {
    const storeId = ctx.storeId
    const em = this.dataSource.manager

    // 1. Get all customer profiles who are eligible for credit
    const customers = await em.find(UserEntity, {
      where: { storeId },
      order: { name: 'ASC' },
    })

    // Preload all AR entries to avoid N+1 queries
    const allEntries = await em.find(ArLedgerEntity, {
      where: { storeId },
      order: { createdAt: 'ASC', id: 'ASC' },
    })

    const entriesMap = new Map<string, ArLedgerEntity[]>()
    for (const entry of allEntries) {
      const list = entriesMap.get(entry.customerId) ?? []
      list.push(entry)
      entriesMap.set(entry.customerId, list)
    }

    const report: any[] = []
    const now = new Date()

    for (const customer of customers) {
      const entries = entriesMap.get(customer.id) ?? []

      if (entries.length === 0) continue

      const totalOutstanding = entries.reduce((sum, e) => sum + Number(e.amount), 0)
      if (totalOutstanding <= 0) continue // Skip customers with no outstanding debt

      // Standard FIFO aging allocation:
      // We will look at all positive INVOICE transactions.
      // If we have payments, we subtract them from the oldest invoices first.
      const invoices = entries.filter((e) => e.type === ArTransactionType.INVOICE)
      const paymentsTotal = Math.abs(
        entries
          .filter((e) =>
            [
              ArTransactionType.PAYMENT,
              ArTransactionType.WRITE_OFF,
              ArTransactionType.CREDIT_NOTE,
            ].includes(e.type),
          )
          .reduce((sum, e) => sum + Number(e.amount), 0),
      )

      let remainingPayment = paymentsTotal
      let current = 0
      let d1to30 = 0
      let d31to60 = 0
      let d61to90 = 0
      let d90plus = 0

      for (const invoice of invoices) {
        const invAmt = Number(invoice.amount)
        let unpaidAmt = invAmt

        if (remainingPayment >= unpaidAmt) {
          remainingPayment -= unpaidAmt
          unpaidAmt = 0
        } else {
          unpaidAmt -= remainingPayment
          remainingPayment = 0
        }

        if (unpaidAmt > 0) {
          // Calculate how many days this invoice is overdue
          const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date(invoice.createdAt)
          const diffTime = now.getTime() - dueDate.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          if (diffDays <= 0) {
            current += unpaidAmt
          } else if (diffDays <= 30) {
            d1to30 += unpaidAmt
          } else if (diffDays <= 60) {
            d31to60 += unpaidAmt
          } else if (diffDays <= 90) {
            d61to90 += unpaidAmt
          } else {
            d90plus += unpaidAmt
          }
        }
      }

      report.push({
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        companyName: customer.companyName || 'N/A',
        creditLimit: Number(customer.creditLimit || 0),
        creditHold: customer.creditHold,
        totalOutstanding,
        aging: {
          current,
          '1-30': d1to30,
          '31-60': d31to60,
          '61-90': d61to90,
          '90+': d90plus,
        },
      })
    }

    return report
  }

  /**
   * Retrieves all ledger entries for a single customer.
   */
  async getCustomerLedger(customerId: string, storeId: string): Promise<ArLedgerEntity[]> {
    return this.dataSource.manager.find(ArLedgerEntity, {
      where: { customerId, storeId },
      order: { createdAt: 'DESC', id: 'DESC' },
    })
  }

  /**
   * Generates an Accounts Payable (AP) aging report scoped to a supplier entity.
   * Mirrors getArAgingReport but for the payable side (supplier invoices vs. payments).
   * Requires the purchase module's SupplierInvoice/SupplierPayment entities to be loaded.
   */
  async getApAgingReport(ctx: RequestContextDto): Promise<any[]> {
    const storeId = ctx.storeId
    const em = this.dataSource.manager

    // Load all AP ledger entries (supplier invoices are positive, payments are negative)
    const allEntries = await em.find(ArLedgerEntity, {
      where: { storeId, referenceType: 'SUPPLIER_INVOICE' },
      order: { createdAt: 'ASC', id: 'ASC' },
    })

    const paymentEntries = await em.find(ArLedgerEntity, {
      where: { storeId, referenceType: 'SUPPLIER_PAYMENT' },
      order: { createdAt: 'ASC', id: 'ASC' },
    })

    // Group by a proxy of supplier (referenceId grouping until SupplierEntity is added)
    const allByRef = new Map<string, ArLedgerEntity[]>()
    for (const entry of [...allEntries, ...paymentEntries]) {
      const key = entry.customerId // reused as supplierId in AP context
      const list = allByRef.get(key) ?? []
      list.push(entry)
      allByRef.set(key, list)
    }

    const now = new Date()
    const report: any[] = []

    for (const [supplierId, entries] of allByRef.entries()) {
      const invoices = entries.filter((e) => e.referenceType === 'SUPPLIER_INVOICE')
      const paymentsTotal = Math.abs(
        entries
          .filter((e) => e.referenceType === 'SUPPLIER_PAYMENT')
          .reduce((sum, e) => sum + Number(e.amount), 0),
      )

      const totalOutstanding = invoices.reduce((sum, e) => sum + Number(e.amount), 0) - paymentsTotal
      if (totalOutstanding <= 0) continue

      let remainingPayment = paymentsTotal
      let current = 0, d1to30 = 0, d31to60 = 0, d61to90 = 0, d90plus = 0

      for (const invoice of invoices) {
        const invAmt = Number(invoice.amount)
        let unpaidAmt = invAmt
        if (remainingPayment >= unpaidAmt) {
          remainingPayment -= unpaidAmt
          unpaidAmt = 0
        } else {
          unpaidAmt -= remainingPayment
          remainingPayment = 0
        }
        if (unpaidAmt > 0) {
          const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date(invoice.createdAt)
          const diffDays = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          if (diffDays <= 0) current += unpaidAmt
          else if (diffDays <= 30) d1to30 += unpaidAmt
          else if (diffDays <= 60) d31to60 += unpaidAmt
          else if (diffDays <= 90) d61to90 += unpaidAmt
          else d90plus += unpaidAmt
        }
      }

      report.push({
        supplierId,
        totalOutstanding,
        aging: { current, '1-30': d1to30, '31-60': d31to60, '61-90': d61to90, '90+': d90plus },
      })
    }

    return report
  }
}
