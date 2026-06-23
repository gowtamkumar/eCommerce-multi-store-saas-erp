import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { DataSource, EntityManager, In } from 'typeorm'
import { AccountEntity } from '../entities/account.entity'
import { JournalEntryEntity } from '../entities/journal-entry.entity'
import { LedgerEntryEntity } from '../entities/ledger-entry.entity'
import { FiscalPeriodEntity, FiscalPeriodStatus } from '../entities/fiscal-period.entity'
import { DEFAULT_CHART_OF_ACCOUNTS } from '../constants/default-coa'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { LedgerEntrySide, JournalType } from '@/common/enums/journal-type.enum'
import { AccountType, AccountCategory } from '@/common/enums/account-type.enum'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { CurrencyFeedService } from './currency-feed.service'

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly currencyFeedService: CurrencyFeedService,
  ) {}

  /**
   * Initializes the default Chart of Accounts for a tenant.
   * Should be called during tenant onboarding.
   */
  async initializeTenantCOA(ctx: RequestContextDto, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(AccountEntity)
      : this.dataSource.getRepository(AccountEntity)
    const tenantId = ctx.tenantId

    const count = await repo.count({ where: { tenantId } })
    if (count > 0) return

    this.logger.log(`Initializing COA for tenant ${tenantId}`)

    const accounts = DEFAULT_CHART_OF_ACCOUNTS.map((coa) =>
      repo.create({
        ...coa,
        tenantId,
      }),
    )

    await repo.save(accounts)
  }

  /**
   * Records a double-entry journal transaction.
   * Ensures debits = credits.
   */
  async createJournalEntry(
    data: {
      date?: Date
      type: JournalType
      description: string
      referenceType?: string
      referenceId?: string
      isReversal?: boolean
      reversedJournalEntryId?: string
      currency?: string
      exchangeRate?: number
      lines: { accountCode: string; side: LedgerEntrySide; amount: number; exchangeRate?: number }[]
    },
    ctx: RequestContextDto,
    manager?: EntityManager,
  ) {
    const tenantId = ctx.tenantId
    const queryRunner = manager ? null : this.dataSource.createQueryRunner()
    const em = manager || queryRunner.manager

    if (queryRunner) {
      await queryRunner.connect()
      await queryRunner.startTransaction()
    }

    try {
      const { lines, ...header } = data

      // 0. Validate Fiscal Period is OPEN
      const dateToCheck = data.date ? new Date(data.date) : new Date()
      const closedPeriod = await em
        .createQueryBuilder(FiscalPeriodEntity, 'fp')
        .where('fp.tenantId = :tenantId', { tenantId })
        .andWhere('fp.status = :status', { status: FiscalPeriodStatus.CLOSED })
        .andWhere(':dateToCheck BETWEEN fp.startDate AND fp.endDate', { dateToCheck })
        .getOne()

      if (closedPeriod) {
        throw new BadRequestException(
          `Cannot post transaction. The date ${dateToCheck.toLocaleDateString()} falls within the closed fiscal period "${closedPeriod.name}".`,
        )
      }

      // Determine Base Currency and Exchange Rate
      const settings = await em.findOne(SiteSettingsEntity, { where: { tenantId } })
      const baseCurrency = (settings?.currency || 'USD').toUpperCase()
      const txCurrency = (data.currency || baseCurrency).toUpperCase()

      let headerExchangeRate = Number(data.exchangeRate)
      if (txCurrency === baseCurrency) {
        headerExchangeRate = 1.0
      } else if (!headerExchangeRate || isNaN(headerExchangeRate)) {
        headerExchangeRate = await this.currencyFeedService.getExchangeRate(txCurrency, baseCurrency)
      }

      // 1. Validate balanced entry in transaction currency
      const debitTotalTx = lines
        .filter((l) => l.side === LedgerEntrySide.DEBIT)
        .reduce((sum, l) => sum + Number(l.amount), 0)
      const creditTotalTx = lines
        .filter((l) => l.side === LedgerEntrySide.CREDIT)
        .reduce((sum, l) => sum + Number(l.amount), 0)

      if (Math.abs(debitTotalTx - creditTotalTx) > 0.01) {
        throw new BadRequestException(
          `Unbalanced journal entry in transaction currency (${txCurrency}): Debits (${debitTotalTx}) != Credits (${creditTotalTx})`,
        )
      }

      // Convert lines to base currency
      const baseLines = lines.map((line) => {
        const txAmount = Number(line.amount)
        let lineRate = line.exchangeRate !== undefined && line.exchangeRate !== null ? Number(line.exchangeRate) : headerExchangeRate
        if (txCurrency === baseCurrency) {
          lineRate = 1.0
        } else if (!lineRate || isNaN(lineRate)) {
          lineRate = headerExchangeRate
        }
        const baseAmount = Number((txAmount * lineRate).toFixed(2))
        return {
          ...line,
          txAmount,
          exchangeRate: lineRate,
          baseAmount,
        }
      })

      // Verify base currency balanced entry (allowing 0.02 tolerance)
      let debitTotalBase = baseLines
        .filter((l) => l.side === LedgerEntrySide.DEBIT)
        .reduce((sum, l) => sum + l.baseAmount, 0)
      let creditTotalBase = baseLines
        .filter((l) => l.side === LedgerEntrySide.CREDIT)
        .reduce((sum, l) => sum + l.baseAmount, 0)

      let diff = debitTotalBase - creditTotalBase

      // Automatically insert a balancing line to the Forex Gain/Loss account 8000 when discrepancy exceeds 0.02
      if (Math.abs(diff) > 0.02) {
        let forexAccount = await em.findOne(AccountEntity, {
          where: { code: '8000', tenantId },
        })
        if (!forexAccount) {
          forexAccount = em.create(AccountEntity, {
            code: '8000',
            name: 'Foreign Exchange Gain/Loss',
            type: AccountType.EXPENSE,
            category: AccountCategory.OPERATING_EXPENSE,
            isSystem: true,
            balance: 0,
            tenantId,
          })
          await em.save(AccountEntity, forexAccount)
        }

        const forexSide = diff > 0 ? LedgerEntrySide.CREDIT : LedgerEntrySide.DEBIT
        const forexBaseAmount = Number(Math.abs(diff).toFixed(2))

        baseLines.push({
          accountCode: '8000',
          side: forexSide,
          amount: 0,
          txAmount: 0,
          exchangeRate: 0,
          baseAmount: forexBaseAmount,
        })

        // Recompute totals
        debitTotalBase = baseLines
          .filter((l) => l.side === LedgerEntrySide.DEBIT)
          .reduce((sum, l) => sum + l.baseAmount, 0)
        creditTotalBase = baseLines
          .filter((l) => l.side === LedgerEntrySide.CREDIT)
          .reduce((sum, l) => sum + l.baseAmount, 0)
        diff = debitTotalBase - creditTotalBase
      }

      // Absorb rounding tolerance discrepancy into the last line to balance exactly
      if (Math.abs(diff) > 0.0001 && Math.abs(diff) <= 0.02 && baseLines.length > 0) {
        const lastLine = baseLines[baseLines.length - 1]
        if (lastLine.side === LedgerEntrySide.DEBIT) {
          lastLine.baseAmount = Number((lastLine.baseAmount - diff).toFixed(2))
        } else {
          lastLine.baseAmount = Number((lastLine.baseAmount + diff).toFixed(2))
        }
      }

      // 2. Create Journal Header
      const journal = em.create(JournalEntryEntity, {
        ...header,
        totalAmount: debitTotalTx,
        currency: txCurrency,
        exchangeRate: headerExchangeRate,
        tenantId,
        isReversal: data.isReversal || false,
        reversedJournalEntryId: data.reversedJournalEntryId || null,
      })
      if (data.date) {
        journal.createdAt = new Date(data.date)
      }
      const savedJournal = (await em.save(JournalEntryEntity, journal)) as JournalEntryEntity

      // 3. Process Ledger Lines
      const uniqueCodes = [...new Set(baseLines.map((l) => l.accountCode))]
      const accounts = (await em.find(AccountEntity, {
        where: { code: In(uniqueCodes), tenantId },
      })) as AccountEntity[]
      const accountByCode = new Map(accounts.map((a) => [a.code, a]))

      const missingCode = uniqueCodes.find((code) => !accountByCode.has(code))
      if (missingCode) {
        throw new NotFoundException(
          `Account with code ${missingCode} not found for tenant ${tenantId}`,
        )
      }

      const ledgerEntries: LedgerEntryEntity[] = []
      const affectedAccounts = new Set<AccountEntity>()

      for (const line of baseLines) {
        const account = accountByCode.get(line.accountCode)!

        // Update Account Balance using converted base currency amount
        const amount = line.baseAmount
        if (line.side === LedgerEntrySide.DEBIT) {
          const isDebitIncrease =
            account.type === AccountType.ASSET || account.type === AccountType.EXPENSE

          account.balance = isDebitIncrease
            ? Number(account.balance) + amount
            : Number(account.balance) - amount
        } else {
          const isCreditIncrease =
            account.type === AccountType.LIABILITY ||
            account.type === AccountType.EQUITY ||
            account.type === AccountType.REVENUE

          account.balance = isCreditIncrease
            ? Number(account.balance) + amount
            : Number(account.balance) - amount
        }
        affectedAccounts.add(account)

        // Create Ledger Entry
        ledgerEntries.push(
          em.create(LedgerEntryEntity, {
            journalEntryId: savedJournal.id,
            accountId: account.id,
            side: line.side,
            amount,
            transactionCurrency: txCurrency,
            transactionAmount: line.txAmount,
            exchangeRate: line.exchangeRate,
            balanceAfter: account.balance,
            tenantId,
          }),
        )
      }

      await em.save(AccountEntity, [...affectedAccounts])
      await em.save(LedgerEntryEntity, ledgerEntries)

      if (queryRunner) await queryRunner.commitTransaction()
      return savedJournal
    } catch (err) {
      if (queryRunner) await queryRunner.rollbackTransaction()
      throw err
    } finally {
      if (queryRunner) await queryRunner.release()
    }
  }

  async findAccountByCode(code: string, tenantId: string): Promise<AccountEntity | null> {
    return this.dataSource.getRepository(AccountEntity).findOne({ where: { code, tenantId } })
  }

  // Account CRUD
  async getAccounts(ctx: RequestContextDto): Promise<AccountEntity[]> {
    return this.dataSource.getRepository(AccountEntity).find({
      where: { tenantId: ctx.tenantId },
      order: { code: 'ASC' },
    })
  }

  async createAccount(
    data: {
      code: string
      name: string
      type: AccountType
      category: AccountCategory
      isSystem?: boolean
    },
    ctx: RequestContextDto,
  ): Promise<AccountEntity> {
    const repo = this.dataSource.getRepository(AccountEntity)
    const existing = await repo.findOne({ where: { code: data.code, tenantId: ctx.tenantId } })
    if (existing) {
      throw new BadRequestException(`Account with code ${data.code} already exists.`)
    }
    const account = repo.create({
      ...data,
      tenantId: ctx.tenantId,
      balance: 0,
    })
    return repo.save(account)
  }

  async updateAccount(
    id: string,
    data: { name: string; type: AccountType; category: AccountCategory },
    ctx: RequestContextDto,
  ): Promise<AccountEntity> {
    const repo = this.dataSource.getRepository(AccountEntity)
    const account = await repo.findOne({ where: { id, tenantId: ctx.tenantId } })
    if (!account) {
      throw new NotFoundException('Account not found')
    }
    if (account.isSystem) {
      throw new BadRequestException('Cannot modify system-level accounts')
    }
    Object.assign(account, data)
    return repo.save(account)
  }

  async deleteAccount(id: string, ctx: RequestContextDto): Promise<void> {
    const repo = this.dataSource.getRepository(AccountEntity)
    const account = await repo.findOne({ where: { id, tenantId: ctx.tenantId } })
    if (!account) {
      throw new NotFoundException('Account not found')
    }
    if (account.isSystem) {
      throw new BadRequestException('Cannot delete system-level accounts')
    }
    if (Number(account.balance) !== 0) {
      throw new BadRequestException('Cannot delete an account with a non-zero balance')
    }
    await repo.softRemove(account)
  }

  async getJournalEntries(ctx: RequestContextDto): Promise<JournalEntryEntity[]> {
    return this.dataSource.getRepository(JournalEntryEntity).find({
      where: { tenantId: ctx.tenantId },
      relations: {
        lines: {
          account: true,
        },
      },
      order: { createdAt: 'DESC', date: 'DESC' },
    })
  }

  // Fiscal Period Management
  async getFiscalPeriods(ctx: RequestContextDto): Promise<FiscalPeriodEntity[]> {
    return this.dataSource.getRepository(FiscalPeriodEntity).find({
      where: { tenantId: ctx.tenantId },
      order: { startDate: 'DESC' },
    })
  }

  async createFiscalPeriod(
    data: { name: string; startDate: string; endDate: string },
    ctx: RequestContextDto,
  ): Promise<FiscalPeriodEntity> {
    const repo = this.dataSource.getRepository(FiscalPeriodEntity)
    const period = repo.create({
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: FiscalPeriodStatus.OPEN,
      tenantId: ctx.tenantId,
    })
    return repo.save(period)
  }

  async setFiscalPeriodStatus(
    id: string,
    status: FiscalPeriodStatus,
    ctx: RequestContextDto,
  ): Promise<FiscalPeriodEntity> {
    const repo = this.dataSource.getRepository(FiscalPeriodEntity)
    const period = await repo.findOne({ where: { id, tenantId: ctx.tenantId } })
    if (!period) {
      throw new NotFoundException('Fiscal period not found')
    }
    period.status = status
    return repo.save(period)
  }

  async reverseJournalEntry(
    id: string,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<JournalEntryEntity> {
    const tenantId = ctx.tenantId
    const queryRunner = manager ? null : this.dataSource.createQueryRunner()
    const em = manager || queryRunner.manager

    if (queryRunner) {
      await queryRunner.connect()
      await queryRunner.startTransaction()
    }

    try {
      // 1. Fetch original entry with lines and account relation
      const original = await em.findOne(JournalEntryEntity, {
        where: { id, tenantId },
        relations: {
          lines: {
            account: true,
          },
        },
      })

      if (!original) {
        throw new NotFoundException(`Journal entry with ID ${id} not found`)
      }

      if (original.isReversal) {
        throw new BadRequestException('Cannot reverse a journal entry that is already a reversal')
      }

      // Check if this journal entry has already been reversed
      const alreadyReversed = await em.findOne(JournalEntryEntity, {
        where: { reversedJournalEntryId: id, tenantId },
      })
      if (alreadyReversed) {
        throw new BadRequestException('This journal entry has already been reversed')
      }

      // 2. Swapping debits and credits, filtering out existing forex lines
      const reversingLines = original.lines
        .filter((line) => line.account.code !== '8000')
        .map((line) => {
          const reversedSide =
            line.side === LedgerEntrySide.DEBIT ? LedgerEntrySide.CREDIT : LedgerEntrySide.DEBIT
          return {
            accountCode: line.account.code,
            side: reversedSide,
            amount: Number(line.transactionAmount || line.amount),
            exchangeRate: Number(line.exchangeRate),
          }
        })

      // 3. Create the new reversing journal entry
      const reversingEntry = await this.createJournalEntry(
        {
          date: new Date(),
          type: original.type,
          description: `Reversal of: ${original.description} (Ref ID: ${original.id})`,
          referenceType: 'REVERSAL',
          referenceId: original.id,
          isReversal: true,
          reversedJournalEntryId: original.id,
          currency: original.currency,
          exchangeRate: original.exchangeRate,
          lines: reversingLines,
        },
        ctx,
        em,
      )

      if (queryRunner) await queryRunner.commitTransaction()
      return reversingEntry
    } catch (err) {
      if (queryRunner) await queryRunner.rollbackTransaction()
      throw err
    } finally {
      if (queryRunner) await queryRunner.release()
    }
  }
}
