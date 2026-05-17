import { AccountType, AccountCategory } from '@/common/enums/account-type.enum'

export const DEFAULT_CHART_OF_ACCOUNTS = [
  {
    code: '1000',
    name: 'Cash',
    type: AccountType.ASSET,
    category: AccountCategory.CASH_BANK,
    isSystem: true,
  },
  {
    code: '1100',
    name: 'Inventory',
    type: AccountType.ASSET,
    category: AccountCategory.INVENTORY,
    isSystem: true,
  },
  {
    code: '1200',
    name: 'Accounts Receivable',
    type: AccountType.ASSET,
    category: AccountCategory.RECEIVABLE,
    isSystem: true,
  },
  {
    code: '2100',
    name: 'Accounts Payable',
    type: AccountType.LIABILITY,
    category: AccountCategory.PAYABLE,
    isSystem: true,
  },
  {
    code: '3000',
    name: 'Retained Earnings',
    type: AccountType.EQUITY,
    category: AccountCategory.EQUITY,
    isSystem: true,
  },
  {
    code: '4000',
    name: 'Sales Revenue',
    type: AccountType.REVENUE,
    category: AccountCategory.SALES,
    isSystem: true,
  },
  {
    code: '5000',
    name: 'Cost of Goods Sold',
    type: AccountType.EXPENSE,
    category: AccountCategory.COGS,
    isSystem: true,
  },
  {
    code: '6000',
    name: 'Operating Expenses',
    type: AccountType.EXPENSE,
    category: AccountCategory.OPERATING_EXPENSE,
    isSystem: false,
  },
]
