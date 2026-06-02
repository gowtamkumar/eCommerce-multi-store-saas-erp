import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { AccountEntity } from '../entities/account.entity'
import { LedgerEntryEntity } from '../entities/ledger-entry.entity'
import { AccountCategory, AccountType } from '@/common/enums/account-type.enum'
import { LedgerEntrySide, JournalType } from '@/common/enums/journal-type.enum'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class FinancialReportService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Generates a fully GL-backed Profit & Loss statement based on
   * dynamic historical ledger entries within a specified date range.
   */
  async getProfitAndLoss(ctx: RequestContextDto, query?: { startDate?: string; endDate?: string }) {
    const tenantId = ctx.tenantId
    const accountsRepo = this.dataSource.getRepository(AccountEntity)

    // Retrieve all Revenue and Expense accounts
    const accounts = await accountsRepo.find({
      where: { tenantId },
    })

    const revenueAccounts = accounts.filter((a) => a.type === AccountType.REVENUE)
    const expenseAccounts = accounts.filter((a) => a.type === AccountType.EXPENSE)

    const revenueAccountIds = revenueAccounts.map((a) => a.id)
    const expenseAccountIds = expenseAccounts.map((a) => a.id)
    const allPlAccountIds = [...revenueAccountIds, ...expenseAccountIds]

    // Initialize account periods balances map
    const periodicBalances: Record<string, number> = {}
    accounts.forEach((a) => {
      periodicBalances[a.id] = 0
    })

    if (allPlAccountIds.length > 0) {
      // Query ledger entry lines scoped inside target dates and sum them grouped by account and side
      const qb = this.dataSource
        .getRepository(LedgerEntryEntity)
        .createQueryBuilder('le')
        .select('le.accountId', 'accountId')
        .addSelect('le.side', 'side')
        .addSelect('SUM(le.amount)', 'total')
        .leftJoin('le.journalEntry', 'je')
        .where('le.tenantId = :tenantId', { tenantId })
        .andWhere('le.accountId IN (:...allPlAccountIds)', { allPlAccountIds })

      if (query?.startDate) {
        qb.andWhere('je.date >= :startDate', { startDate: new Date(query.startDate) })
      }
      if (query?.endDate) {
        // Enforce full end of day limit
        const end = new Date(query.endDate)
        end.setHours(23, 59, 59, 999)
        qb.andWhere('je.date <= :endDate', { endDate: end })
      }

      qb.groupBy('le.accountId').addGroupBy('le.side')
      const sums = await qb.getRawMany()

      // Calculate net balances based on double-entry side impacts
      for (const sumRow of sums) {
        const accountId = sumRow.accountId
        const side = sumRow.side
        const total = Number(sumRow.total || 0)

        const account = accounts.find((a) => a.id === accountId)
        if (!account) continue

        if (account.type === AccountType.REVENUE) {
          // Credits increase revenue, debits decrease
          if (side === LedgerEntrySide.CREDIT) {
            periodicBalances[accountId] += total
          } else {
            periodicBalances[accountId] -= total
          }
        } else if (account.type === AccountType.EXPENSE) {
          // Debits increase expense, credits decrease
          if (side === LedgerEntrySide.DEBIT) {
            periodicBalances[accountId] += total
          } else {
            periodicBalances[accountId] -= total
          }
        }
      }
    }

    // Assemble P&L items & dynamic categories
    let salesTotal = 0
    let cogsTotal = 0
    let operatingExpTotal = 0

    const revenueBreakdown = revenueAccounts.map((a) => {
      const balance = periodicBalances[a.id]
      salesTotal += balance
      return {
        code: a.code,
        name: a.name,
        category: a.category,
        balance,
      }
    })

    const cogsBreakdown = expenseAccounts
      .filter((a) => a.category === AccountCategory.COGS)
      .map((a) => {
        const balance = periodicBalances[a.id]
        cogsTotal += balance
        return {
          code: a.code,
          name: a.name,
          category: a.category,
          balance,
        }
      })

    const operatingExpBreakdown = expenseAccounts
      .filter((a) => a.category !== AccountCategory.COGS)
      .map((a) => {
        const balance = periodicBalances[a.id]
        operatingExpTotal += balance
        return {
          code: a.code,
          name: a.name,
          category: a.category,
          balance,
        }
      })

    const grossProfit = salesTotal - cogsTotal
    const netProfit = grossProfit - operatingExpTotal

    return {
      revenue: salesTotal,
      costOfGoodsSold: cogsTotal,
      grossProfit,
      operatingExpenses: operatingExpTotal,
      netProfit,
      revenueBreakdown,
      cogsBreakdown,
      operatingExpBreakdown,
    }
  }

  /**
   * Generates a fully GL-backed Balance Sheet report supporting historical date (asOfDate) scoping.
   */
  async getBalanceSheet(ctx: RequestContextDto, query?: { asOfDate?: string }) {
    const tenantId = ctx.tenantId
    const accountsRepo = this.dataSource.getRepository(AccountEntity)

    // Load all Accounts
    const accounts = await accountsRepo.find({ where: { tenantId } })
    const allAccountIds = accounts.map((a) => a.id)

    // Map cumulative ledger balance from the beginning up to selected date
    const historicalBalances: Record<string, number> = {}
    accounts.forEach((a) => {
      historicalBalances[a.id] = 0
    })

    if (allAccountIds.length > 0) {
      const qb = this.dataSource
        .getRepository(LedgerEntryEntity)
        .createQueryBuilder('le')
        .select('le.accountId', 'accountId')
        .addSelect('le.side', 'side')
        .addSelect('SUM(le.amount)', 'total')
        .leftJoin('le.journalEntry', 'je')
        .where('le.tenantId = :tenantId', { tenantId })
        .andWhere('le.accountId IN (:...allAccountIds)', { allAccountIds })

      if (query?.asOfDate) {
        const limitDate = new Date(query.asOfDate)
        limitDate.setHours(23, 59, 59, 999)
        qb.andWhere('je.date <= :limitDate', { limitDate })
      }

      qb.groupBy('le.accountId').addGroupBy('le.side')
      const sums = await qb.getRawMany()

      for (const sumRow of sums) {
        const accountId = sumRow.accountId
        const side = sumRow.side
        const total = Number(sumRow.total || 0)

        const account = accounts.find((a) => a.id === accountId)
        if (!account) continue

        if (account.type === AccountType.ASSET) {
          // Debits increase, Credits decrease
          if (side === LedgerEntrySide.DEBIT) {
            historicalBalances[accountId] += total
          } else {
            historicalBalances[accountId] -= total
          }
        } else if (account.type === AccountType.LIABILITY || account.type === AccountType.EQUITY) {
          // Credits increase, Debits decrease
          if (side === LedgerEntrySide.CREDIT) {
            historicalBalances[accountId] += total
          } else {
            historicalBalances[accountId] -= total
          }
        }
      }
    }

    const assets = accounts
      .filter((a) => a.type === AccountType.ASSET)
      .map((a) => ({
        code: a.code,
        name: a.name,
        category: a.category,
        balance: historicalBalances[a.id],
      }))

    const liabilities = accounts
      .filter((a) => a.type === AccountType.LIABILITY)
      .map((a) => ({
        code: a.code,
        name: a.name,
        category: a.category,
        balance: historicalBalances[a.id],
      }))

    const equity = accounts
      .filter((a) => a.type === AccountType.EQUITY)
      .map((a) => ({
        code: a.code,
        name: a.name,
        category: a.category,
        balance: historicalBalances[a.id],
      }))

    return {
      assets,
      totalAssets: assets.reduce((sum, a) => sum + a.balance, 0),
      liabilities,
      totalLiabilities: liabilities.reduce((sum, a) => sum + a.balance, 0),
      equity,
      totalEquity: equity.reduce((sum, a) => sum + a.balance, 0),
    }
  }

  /**
   * Generates Cash Flow based on ledger transactions scoped inside date ranges.
   */
  async getCashFlowStatement(
    ctx: RequestContextDto,
    query?: { startDate?: string; endDate?: string },
  ) {
    const tenantId = ctx.tenantId
    const repo = this.dataSource.getRepository(AccountEntity)

    // Find all cash and bank accounts
    const cashAccounts = await repo.find({
      where: { tenantId, category: AccountCategory.CASH_BANK },
    })

    const cashAccountIds = cashAccounts.map((a) => a.id)
    if (cashAccountIds.length === 0) {
      return {
        operating: { inflows: 0, outflows: 0, net: 0 },
        investing: { inflows: 0, outflows: 0, net: 0 },
        financing: { inflows: 0, outflows: 0, net: 0 },
        netChange: 0,
        startingBalance: 0,
        endingBalance: 0,
      }
    }

    // Load ledger entries that impacted cash/bank accounts inside dates and sum them grouped by side and types
    const qb = this.dataSource
      .getRepository(LedgerEntryEntity)
      .createQueryBuilder('le')
      .select('le.side', 'side')
      .addSelect('je.type', 'type')
      .addSelect('je.referenceType', 'referenceType')
      .addSelect('SUM(le.amount)', 'total')
      .leftJoin('le.journalEntry', 'je')
      .where('le.accountId IN (:...cashAccountIds)', { cashAccountIds })
      .andWhere('le.tenantId = :tenantId', { tenantId })

    if (query?.startDate) {
      qb.andWhere('je.date >= :startDate', { startDate: new Date(query.startDate) })
    }
    if (query?.endDate) {
      const end = new Date(query.endDate)
      end.setHours(23, 59, 59, 999)
      qb.andWhere('je.date <= :endDate', { endDate: end })
    }

    qb.groupBy('le.side').addGroupBy('je.type').addGroupBy('je.referenceType')

    const sums = await qb.getRawMany()

    let operatingIn = 0
    let operatingOut = 0
    let investingIn = 0
    let investingOut = 0
    let financingIn = 0
    let financingOut = 0

    for (const sumRow of sums) {
      const total = Number(sumRow.total || 0)
      const side = sumRow.side
      const type = sumRow.type
      const referenceType = sumRow.referenceType
      const isDebit = side === LedgerEntrySide.DEBIT

      if (isDebit) {
        // Cash Inflow
        if (
          type === JournalType.SALES ||
          referenceType === 'AR_PAYMENT' ||
          referenceType === 'CUSTOMER_PAYMENT'
        ) {
          operatingIn += total
        } else if (referenceType === 'EQUITY_INJECTION' || referenceType === 'LOAN_RECEIPT') {
          financingIn += total
        } else {
          operatingIn += total
        }
      } else {
        // Cash Outflow
        if (
          type === JournalType.PURCHASE ||
          referenceType === 'SUPPLIER_INVOICE' ||
          referenceType === 'EXPENSE' ||
          referenceType === 'SUPPLIER_PAYMENT'
        ) {
          operatingOut += total
        } else if (referenceType === 'ASSET_PURCHASE') {
          investingOut += total
        } else if (referenceType === 'LOAN_REPAYMENT' || referenceType === 'DIVIDEND_PAYMENT') {
          financingOut += total
        } else {
          operatingOut += total
        }
      }
    }

    const netOperating = operatingIn - operatingOut
    const netInvesting = investingIn - investingOut
    const netFinancing = financingIn - financingOut
    const netChange = netOperating + netInvesting + netFinancing

    // Find current ending balances of cash accounts
    const endingBalance = cashAccounts.reduce((sum, a) => sum + Number(a.balance), 0)
    const startingBalance = endingBalance - netChange

    return {
      operating: { inflows: operatingIn, outflows: operatingOut, net: netOperating },
      investing: { inflows: investingIn, outflows: investingOut, net: netInvesting },
      financing: { inflows: financingIn, outflows: financingOut, net: netFinancing },
      netChange,
      startingBalance,
      endingBalance,
    }
  }
}
