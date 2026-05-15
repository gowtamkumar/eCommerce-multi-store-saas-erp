import { Injectable, Logger } from '@nestjs/common'
import { AccountingService } from './accounting.service'
import { InventoryLedgerEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/inventory-ledger.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'
import { EntityManager } from 'typeorm'

@Injectable()
export class AccountingIntegrationService {
  private readonly logger = new Logger(AccountingIntegrationService.name)

  constructor(private readonly accountingService: AccountingService) {}

  /**
   * Translates an inventory ledger entry into a financial journal entry.
   */
  async postInventoryMovement(
    ledgerEntry: InventoryLedgerEntity,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ) {
    const { type, quantity, unitCost, cogsAmount, referenceType, referenceId, remarks } = ledgerEntry
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
        // Add more cases for Adjustment, Return, etc.
      }
    } catch (error) {
      this.logger.error(`Failed to post financial entry for ledger ${ledgerEntry.id}: ${error.message}`)
      // In a production system, we might want to queue this for retry or mark as "unposted"
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
}
