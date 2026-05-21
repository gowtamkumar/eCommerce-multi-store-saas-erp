import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { AccountEntity } from '../entities/account.entity'
import { JournalEntryEntity } from '../entities/journal-entry.entity'
import { LedgerEntryEntity } from '../entities/ledger-entry.entity'
import { FiscalPeriodEntity, FiscalPeriodStatus } from '../entities/fiscal-period.entity'
import { DEFAULT_CHART_OF_ACCOUNTS } from '../constants/default-coa'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { LedgerEntrySide, JournalType } from '@/common/enums/journal-type.enum'
import { AccountType, AccountCategory } from '@/common/enums/account-type.enum'

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name)

  constructor(private readonly dataSource: DataSource) {}

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
      lines: { accountCode: string; side: LedgerEntrySide; amount: number }[]
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
      const closedPeriod = await em.createQueryBuilder(FiscalPeriodEntity, 'fp')
        .where('fp.tenantId = :tenantId', { tenantId })
        .andWhere('fp.status = :status', { status: FiscalPeriodStatus.CLOSED })
        .andWhere(':dateToCheck BETWEEN fp.startDate AND fp.endDate', { dateToCheck })
        .getOne()

      if (closedPeriod) {
        throw new BadRequestException(
          `Cannot post transaction. The date ${dateToCheck.toLocaleDateString()} falls within the closed fiscal period "${closedPeriod.name}".`,
        )
      }

      // 1. Validate balanced entry
      const debitTotal = lines
        .filter((l) => l.side === LedgerEntrySide.DEBIT)
        .reduce((sum, l) => sum + Number(l.amount), 0)
      const creditTotal = lines
        .filter((l) => l.side === LedgerEntrySide.CREDIT)
        .reduce((sum, l) => sum + Number(l.amount), 0)

      if (Math.abs(debitTotal - creditTotal) > 0.01) {
        throw new BadRequestException(
          `Unbalanced journal entry: Debits (${debitTotal}) != Credits (${creditTotal})`,
        )
      }

      // 2. Create Journal Header
      const journal = em.create(JournalEntryEntity, {
        ...header,
        totalAmount: debitTotal,
        tenantId,
      })
      const savedJournal = (await em.save(JournalEntryEntity, journal)) as JournalEntryEntity

      // 3. Process Ledger Lines
      for (const line of lines) {
        const account = (await em.findOne(AccountEntity, {
          where: { code: line.accountCode, tenantId },
        })) as AccountEntity | null

        if (!account) {
          throw new NotFoundException(
            `Account with code ${line.accountCode} not found for tenant ${tenantId}`,
          )
        }

        // Update Account Balance (standard double-entry rules)
        const amount = Number(line.amount)
        if (line.side === LedgerEntrySide.DEBIT) {
          // Debit INCREASES: Assets (all categories) and Expenses
          // Debit DECREASES: Liabilities, Equity, Revenue
          const isDebitIncrease =
            account.category === AccountCategory.CASH_BANK ||
            account.category === AccountCategory.INVENTORY ||
            account.category === AccountCategory.RECEIVABLE ||
            account.category === AccountCategory.FIXED_ASSET ||
            account.category === AccountCategory.COGS ||
            account.category === AccountCategory.OPERATING_EXPENSE ||
            account.category === AccountCategory.OTHER

          account.balance = isDebitIncrease
            ? Number(account.balance) + amount
            : Number(account.balance) - amount
        } else {
          // Credit INCREASES: Liabilities, Equity, Revenue
          // Credit DECREASES: Assets and Expenses
          const isCreditIncrease =
            account.category === AccountCategory.SALES ||
            account.category === AccountCategory.PAYABLE ||
            account.category === AccountCategory.EQUITY

          account.balance = isCreditIncrease
            ? Number(account.balance) + amount
            : Number(account.balance) - amount
        }

        await em.save(AccountEntity, account)

        // Create Ledger Entry
        const ledgerEntry = em.create(LedgerEntryEntity, {
          journalEntryId: savedJournal.id,
          accountId: account.id,
          side: line.side,
          amount,
          balanceAfter: account.balance,
          tenantId,
        })
        await em.save(LedgerEntryEntity, ledgerEntry)
      }

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
    data: { code: string; name: string; type: AccountType; category: AccountCategory; isSystem?: boolean },
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
    await repo.remove(account)
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
}
