import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { AccountEntity } from '../entities/account.entity'
import { AccountCategory } from '@/common/enums/account-type.enum'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class FinancialReportService {
  constructor(private readonly dataSource: DataSource) {}

  async getProfitAndLoss(ctx: RequestContextDto) {
    const tenantId = ctx.tenantId
    const repo = this.dataSource.getRepository(AccountEntity)

    const accounts = await repo.find({ where: { tenantId } })

    const sales = accounts
      .filter((a) => a.category === AccountCategory.SALES)
      .reduce((sum, a) => sum + Number(a.balance), 0)

    const cogs = accounts
      .filter((a) => a.category === AccountCategory.COGS)
      .reduce((sum, a) => sum + Number(a.balance), 0)

    const expenses = accounts
      .filter((a) => a.category === AccountCategory.OPERATING_EXPENSE)
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
      .filter((a) =>
        [AccountCategory.CASH_BANK, AccountCategory.INVENTORY, AccountCategory.RECEIVABLE].includes(
          a.category,
        ),
      )
      .map((a) => ({ name: a.name, balance: Number(a.balance) }))

    const liabilities = accounts
      .filter((a) => a.category === AccountCategory.PAYABLE)
      .map((a) => ({ name: a.name, balance: Number(a.balance) }))

    const equity = accounts
      .filter((a) => a.category === AccountCategory.EQUITY)
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
}
