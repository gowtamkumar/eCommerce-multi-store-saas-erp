import { RequestContextDto } from '@/common/dto/request-context.dto'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'
import { InventoryLedgerEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/inventory-ledger.entity'
import { Injectable, Logger } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { AccountingService } from './accounting.service'

@Injectable()
export class AccountingIntegrationService {
  private readonly logger = new Logger(AccountingIntegrationService.name)

  constructor(private readonly accountingService: AccountingService) {}

  /**
   * Translates an inventory ledger entry into a financial journal entry.
   *
   * IMPORTANT: This method intentionally does NOT catch errors. Any failure
   * during journal posting is logged and then re-thrown so the caller's
   * database transaction rolls back atomically — preventing a split-brain state
   * where the inventory ledger row is persisted but the accounting journal is not.
   */
  async postInventoryMovement(
    ledgerEntry: InventoryLedgerEntity,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<void> {
    const { type, quantity, unitCost, cogsAmount } = ledgerEntry
    const absQty = Math.abs(quantity)
    const totalCost = absQty * Number(unitCost || 0)

    try {
      switch (type) {
        case InventoryTransactionType.PURCHASE:
          await this.postPurchase(ledgerEntry, totalCost, ctx, manager)
          break
        case InventoryTransactionType.SALE:
          await this.postSaleCogs(ledgerEntry, Number(cogsAmount || 0), ctx, manager)
          break
        case InventoryTransactionType.ADJUSTMENT:
          await this.postAdjustment(ledgerEntry, totalCost, ctx, manager)
          break
        case InventoryTransactionType.RETURN:
          await this.postSaleReturn(ledgerEntry, Number(cogsAmount || 0), ctx, manager)
          break
        default:
          // Transaction types without accounting coverage (TRANSFER, DAMAGE, RESERVATION, etc.)
          // are intentionally skipped here — not an error condition.
          break
      }
    } catch (error: any) {
      // Log with full context for monitoring/alerting before re-throwing.
      // The parent transaction will roll back, keeping inventory and accounting in sync.
      this.logger.error(
        `Accounting post failed for ledger ${ledgerEntry.id} ` +
          `(type=${type}, tenantId=${ledgerEntry.tenantId}): ${error.message}`,
        error.stack,
      )
      throw error
    }
  }

  private async postPurchase(
    ledgerEntry: InventoryLedgerEntity,
    totalCost: number,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ) {
    if (totalCost <= 0) return

    await this.accountingService.createJournalEntry(
      {
        type: JournalType.PURCHASE,
        description: `Inventory Purchase: ${ledgerEntry.remarks || 'Stock intake'}`,
        referenceType: 'INVENTORY_LEDGER',
        referenceId: ledgerEntry.id,
        lines: [
          { accountCode: '1100', side: LedgerEntrySide.DEBIT, amount: totalCost }, // Inventory Asset
          { accountCode: '2100', side: LedgerEntrySide.CREDIT, amount: totalCost }, // Accounts Payable
        ],
      },
      ctx,
      manager,
    )
  }

  private async postSaleCogs(
    ledgerEntry: InventoryLedgerEntity,
    cogsAmount: number,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ) {
    if (cogsAmount <= 0) return

    await this.accountingService.createJournalEntry(
      {
        type: JournalType.SALES,
        description: `COGS for Sale: ${ledgerEntry.referenceId || ''}`,
        referenceType: 'INVENTORY_LEDGER',
        referenceId: ledgerEntry.id,
        lines: [
          { accountCode: '5000', side: LedgerEntrySide.DEBIT, amount: cogsAmount }, // COGS Expense
          { accountCode: '1100', side: LedgerEntrySide.CREDIT, amount: cogsAmount }, // Inventory Asset
        ],
      },
      ctx,
      manager,
    )
  }

  private async postAdjustment(
    ledgerEntry: InventoryLedgerEntity,
    totalCost: number,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ) {
    if (totalCost === 0) return
    const isIncrease = (ledgerEntry.quantity || 0) > 0
    const absCost = Math.abs(totalCost)

    await this.accountingService.createJournalEntry(
      {
        type: JournalType.INVENTORY_ADJUSTMENT,
        description: `Inventory Adjustment (${isIncrease ? 'Gain' : 'Loss'}): ${ledgerEntry.remarks || ''}`,
        referenceType: 'INVENTORY_LEDGER',
        referenceId: ledgerEntry.id,
        lines: isIncrease
          ? [
              { accountCode: '1100', side: LedgerEntrySide.DEBIT, amount: absCost }, // Increase Inventory
              { accountCode: '6000', side: LedgerEntrySide.CREDIT, amount: absCost }, // Credit expense (offset/gain)
            ]
          : [
              { accountCode: '6000', side: LedgerEntrySide.DEBIT, amount: absCost }, // Debit expense (loss)
              { accountCode: '1100', side: LedgerEntrySide.CREDIT, amount: absCost }, // Decrease Inventory
            ],
      },
      ctx,
      manager,
    )
  }

  private async postSaleReturn(
    ledgerEntry: InventoryLedgerEntity,
    cogsAmount: number,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ) {
    if (cogsAmount <= 0) return

    // Put item back into Inventory, reduce COGS
    await this.accountingService.createJournalEntry(
      {
        type: JournalType.SALES,
        description: `Sales Return Inventory Restock: ${ledgerEntry.referenceId || ''}`,
        referenceType: 'INVENTORY_LEDGER',
        referenceId: ledgerEntry.id,
        lines: [
          { accountCode: '1100', side: LedgerEntrySide.DEBIT, amount: cogsAmount }, // Inventory Asset
          { accountCode: '5000', side: LedgerEntrySide.CREDIT, amount: cogsAmount }, // Reduce COGS
        ],
      },
      ctx,
      manager,
    )
  }

  async postSupplierPayment(
    data: { paymentId: string; amount: number; supplierName?: string },
    ctx: RequestContextDto,
    manager?: EntityManager,
  ) {
    const amount = Number(data.amount)
    if (amount <= 0) return

    await this.accountingService.createJournalEntry(
      {
        type: JournalType.CASH_PAYMENT,
        description: `Supplier Payment to ${data.supplierName || 'Supplier'}`,
        referenceType: 'SUPPLIER_PAYMENT',
        referenceId: data.paymentId,
        lines: [
          { accountCode: '2100', side: LedgerEntrySide.DEBIT, amount }, // Reduce Payable Liability
          { accountCode: '1000', side: LedgerEntrySide.CREDIT, amount }, // Reduce Cash/Bank Asset
        ],
      },
      ctx,
      manager,
    )
  }

  async postPayrollRun(
    data: {
      payrollId: string
      grossSalary: number
      taxWithheld: number
      netSalary: number
      employeeName?: string
    },
    ctx: RequestContextDto,
    manager?: EntityManager,
  ) {
    const gross = Number(data.grossSalary)
    const tax = Number(data.taxWithheld)
    const net = Number(data.netSalary)

    if (gross <= 0) return

    const lines = [
      { accountCode: '6000', side: LedgerEntrySide.DEBIT, amount: gross }, // Debit Salary Operating Expense
    ]

    if (net > 0) {
      lines.push({ accountCode: '1000', side: LedgerEntrySide.CREDIT, amount: net }) // Credit Cash/Bank Asset
    }

    if (tax > 0) {
      lines.push({ accountCode: '2200', side: LedgerEntrySide.CREDIT, amount: tax }) // Credit Tax Liability Account
    }

    await this.accountingService.createJournalEntry(
      {
        type: JournalType.GENERAL,
        description: `Payroll Run for ${data.employeeName || 'Staff'}`,
        referenceType: 'PAYROLL_RUN',
        referenceId: data.payrollId,
        lines,
      },
      ctx,
      manager,
    )
  }
}
