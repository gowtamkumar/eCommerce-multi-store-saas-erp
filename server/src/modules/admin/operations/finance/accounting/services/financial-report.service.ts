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

  async getProfitAndLoss(ctx: RequestContextDto) {
    const tenantId = ctx.tenantId
    const repo = this.dataSource.getRepository(AccountEntity)

    const accounts = await repo.find({ where: { tenantId } })

    const sales = accounts
      .filter((a) => a.type === AccountType.REVENUE)
      .reduce((sum, a) => sum + Number(a.balance), 0)

    const cogs = accounts
      .filter((a) => a.category === AccountCategory.COGS)
      .reduce((sum, a) => sum + Number(a.balance), 0)

    const expenses = accounts
      .filter((a) => a.type === AccountType.EXPENSE && a.category !== AccountCategory.COGS)
      .reduce((sum, a) => sum + Number(a.balance), 0)

    const grossProfit = sales - cogs
    const netProfit = grossProfit - expenses

    return {
      revenue: sales,
      costOfGoodsSold: cogs,
      grossProfit,
      operatingExpenses: expenses,
      netProfit,
    }
  }

  async getBalanceSheet(ctx: RequestContextDto) {
    const tenantId = ctx.tenantId
    const repo = this.dataSource.getRepository(AccountEntity)

    const accounts = await repo.find({ where: { tenantId } })

    const assets = accounts
      .filter((a) => a.type === AccountType.ASSET)
      .map((a) => ({ name: a.name, balance: Number(a.balance) }))

    const liabilities = accounts
      .filter((a) => a.type === AccountType.LIABILITY)
      .map((a) => ({ name: a.name, balance: Number(a.balance) }))

    const equity = accounts
      .filter((a) => a.type === AccountType.EQUITY)
      .map((a) => ({ name: a.name, balance: Number(a.balance) }))

    return {
      assets,
      totalAssets: assets.reduce((sum, a) => sum + a.balance, 0),
      liabilities,
      totalLiabilities: liabilities.reduce((sum, a) => sum + a.balance, 0),
      equity,
      totalEquity: equity.reduce((sum, a) => sum + a.balance, 0),
    }
  }

  async getCashFlowStatement(ctx: RequestContextDto) {
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

    // Load ledger entries that impacted cash/bank accounts
    const ledgerEntries = await this.dataSource
      .getRepository(LedgerEntryEntity)
      .createQueryBuilder('le')
      .leftJoinAndSelect('le.journalEntry', 'je')
      .where('le.accountId IN (:...cashAccountIds)', { cashAccountIds })
      .andWhere('le.tenantId = :tenantId', { tenantId })
      .getMany()

    let operatingIn = 0
    let operatingOut = 0
    let investingIn = 0
    let investingOut = 0
    let financingIn = 0
    let financingOut = 0

    for (const le of ledgerEntries) {
      const amount = Number(le.amount)
      const isDebit = le.side === LedgerEntrySide.DEBIT

      if (isDebit) {
        // Cash Inflow
        if (
          le.journalEntry?.type === JournalType.SALES ||
          le.journalEntry?.referenceType === 'AR_PAYMENT' ||
          le.journalEntry?.referenceType === 'CUSTOMER_PAYMENT'
        ) {
          operatingIn += amount
        } else if (
          le.journalEntry?.referenceType === 'EQUITY_INJECTION' ||
          le.journalEntry?.referenceType === 'LOAN_RECEIPT'
        ) {
          financingIn += amount
        } else {
          operatingIn += amount
        }
      } else {
        // Cash Outflow
        if (
          le.journalEntry?.type === JournalType.PURCHASE ||
          le.journalEntry?.referenceType === 'SUPPLIER_INVOICE' ||
          le.journalEntry?.referenceType === 'EXPENSE' ||
          le.journalEntry?.referenceType === 'SUPPLIER_PAYMENT'
        ) {
          operatingOut += amount
        } else if (le.journalEntry?.referenceType === 'ASSET_PURCHASE') {
          investingOut += amount
        } else if (
          le.journalEntry?.referenceType === 'LOAN_REPAYMENT' ||
          le.journalEntry?.referenceType === 'DIVIDEND_PAYMENT'
        ) {
          financingOut += amount
        } else {
          operatingOut += amount
        }
      }
    }

    const netOperating = operatingIn - operatingOut
    const netInvesting = investingIn - investingOut
    const netFinancing = financingIn - financingOut
    const netChange = netOperating + netInvesting + netFinancing

    // Find starting balance of cash accounts
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
