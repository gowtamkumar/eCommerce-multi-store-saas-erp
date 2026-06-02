import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { WalletLedgerEntity } from '../entities/wallet-ledger.entity'
import { WalletTransactionType } from '@/common/enums/wallet-transaction-type.enum'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { AccountingService } from './accounting.service'
import { JournalType, LedgerEntrySide } from '@/common/enums/journal-type.enum'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly accountingService: AccountingService,
  ) {}

  /**
   * Returns the current available wallet balance for a customer.
   * Sums all signed amounts in the ledger — pattern mirrors ArService.getCustomerOutstandingBalance.
   */
  async getAvailableBalance(
    customerId: string,
    tenantId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const em = manager || this.dataSource.manager
    const result = await em
      .createQueryBuilder(WalletLedgerEntity, 'w')
      .select('SUM(w.amount)', 'total')
      .where('w.customer_id = :customerId', { customerId })
      .andWhere('w.tenant_id = :tenantId', { tenantId })
      .getRawOne()

    return Math.max(0, Number(result?.total || 0))
  }

  /**
   * Credits the customer wallet (e.g. refund, gift voucher, manual top-up).
   * GL: Debit Refund Expense (5100) / Credit Wallet Liabilities (2300)
   */
  async creditWallet(
    data: {
      customerId: string
      amount: number
      type: WalletTransactionType
      referenceType?: string
      referenceId?: string
      note?: string
      createdBy?: string
    },
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<WalletLedgerEntity> {
    const em = manager || this.dataSource.manager
    const tenantId = ctx.tenantId
    const amount = Math.abs(Number(data.amount))

    if (amount <= 0) {
      throw new BadRequestException('Credit amount must be greater than zero')
    }

    // Verify customer exists and acquire a pessimistic write lock to prevent concurrent modifications
    const customer = await em
      .createQueryBuilder(UserEntity, 'u')
      .setLock('pessimistic_write')
      .where('u.id = :customerId AND u.tenantId = :tenantId', {
        customerId: data.customerId,
        tenantId,
      })
      .getOne()

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${data.customerId} not found`)
    }

    const currentBalance = await this.getAvailableBalance(data.customerId, tenantId, em)

    const entry = em.create(WalletLedgerEntity, {
      customerId: data.customerId,
      type: data.type,
      amount,
      balanceAfter: currentBalance + amount,
      currency: 'BDT',
      referenceType: data.referenceType || null,
      referenceId: data.referenceId || null,
      note: data.note || null,
      tenantId,
      createdBy: data.createdBy || ctx.userId || null,
    })

    const saved = await em.save(WalletLedgerEntity, entry)

    // GL double-entry: Debit Refund Expense (5100) / Credit Wallet Liabilities (2300)
    await this.accountingService.createJournalEntry(
      {
        type: JournalType.GENERAL,
        description: `Store Credit Issued — Customer: ${customer.name || data.customerId}`,
        referenceType: 'WALLET_LEDGER',
        referenceId: saved.id,
        lines: [
          { accountCode: '5100', side: LedgerEntrySide.DEBIT, amount }, // Refund Expense
          { accountCode: '2300', side: LedgerEntrySide.CREDIT, amount }, // Wallet Liabilities
        ],
      },
      ctx,
      em,
    )

    this.logger.log(
      `Wallet credited: customerId=${data.customerId}, amount=${amount}, type=${data.type}, ref=${data.referenceId}`,
    )

    return saved
  }

  /**
   * Debits the customer wallet at checkout (full or partial order payment).
   * GL: Debit Wallet Liabilities (2300) / Credit Sales Revenue (4000)
   */
  async debitWallet(
    data: {
      customerId: string
      amount: number
      referenceType?: string
      referenceId?: string
      note?: string
      skipGlPost?: boolean
    },
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<WalletLedgerEntity> {
    const em = manager || this.dataSource.manager
    const tenantId = ctx.tenantId
    const amount = Math.abs(Number(data.amount))

    if (amount <= 0) {
      throw new BadRequestException('Debit amount must be greater than zero')
    }

    // Verify customer exists and acquire a pessimistic write lock to serialize wallet transactions
    const customer = await em
      .createQueryBuilder(UserEntity, 'u')
      .setLock('pessimistic_write')
      .where('u.id = :customerId AND u.tenantId = :tenantId', {
        customerId: data.customerId,
        tenantId,
      })
      .getOne()

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${data.customerId} not found`)
    }

    const currentBalance = await this.getAvailableBalance(data.customerId, tenantId, em)

    if (currentBalance < amount) {
      throw new BadRequestException(
        `Insufficient wallet balance. Available: ${currentBalance}, Required: ${amount}`,
      )
    }

    const entry = em.create(WalletLedgerEntity, {
      customerId: data.customerId,
      type: WalletTransactionType.WALLET_SPEND,
      amount: -amount, // Negative — funds leaving the wallet
      balanceAfter: currentBalance - amount,
      currency: 'BDT',
      referenceType: data.referenceType || null,
      referenceId: data.referenceId || null,
      note: data.note || null,
      tenantId,
      createdBy: ctx.userId || null,
    })

    const saved = await em.save(WalletLedgerEntity, entry)

    if (!data.skipGlPost) {
      // GL double-entry: Debit Wallet Liabilities (2300) / Credit Sales Revenue (4000)
      await this.accountingService.createJournalEntry(
        {
          type: JournalType.GENERAL,
          description: `Wallet Balance Used at Checkout — Ref: ${data.referenceId || 'N/A'}`,
          referenceType: 'WALLET_LEDGER',
          referenceId: saved.id,
          lines: [
            { accountCode: '2300', side: LedgerEntrySide.DEBIT, amount }, // Wallet Liabilities
            { accountCode: '4000', side: LedgerEntrySide.CREDIT, amount }, // Sales Revenue
          ],
        },
        ctx,
        em,
      )
    }

    this.logger.log(
      `Wallet debited: customerId=${data.customerId}, amount=${amount}, ref=${data.referenceId}`,
    )

    return saved
  }

  /**
   * Returns the full chronological wallet history for a customer (admin view).
   */
  async getCustomerWalletHistory(
    customerId: string,
    tenantId: string,
  ): Promise<WalletLedgerEntity[]> {
    return this.dataSource.manager.find(WalletLedgerEntity, {
      where: { customerId, tenantId },
      order: { createdAt: 'DESC', id: 'DESC' },
    })
  }

  /**
   * Returns the balance + recent history for a customer (combined storefront endpoint).
   */
  async getCustomerWalletSummary(
    customerId: string,
    tenantId: string,
  ): Promise<{ balance: number; history: WalletLedgerEntity[] }> {
    const [balance, history] = await Promise.all([
      this.getAvailableBalance(customerId, tenantId),
      this.getCustomerWalletHistory(customerId, tenantId),
    ])
    return { balance, history }
  }
}
