import { AccountType, AccountCategory } from '@/common/enums/account-type.enum'

export const US_GAAP_COA = [
  {
    code: '1000',
    name: 'Cash & Cash Equivalents',
    type: AccountType.ASSET,
    category: AccountCategory.CASH_BANK,
    isSystem: true,
  },
  {
    code: '1100',
    name: 'Merchandise Inventory',
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
    name: 'Product Sales Revenue',
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
    code: '5100',
    name: 'Sales Refunds & Allowances',
    type: AccountType.EXPENSE,
    category: AccountCategory.OPERATING_EXPENSE,
    isSystem: true,
  },
  {
    code: '2300',
    name: 'Customer Gift Card & Wallet Liabilities',
    type: AccountType.LIABILITY,
    category: AccountCategory.OTHER,
    isSystem: true,
  },
  {
    code: '2200',
    name: 'Sales Tax Payable',
    type: AccountType.LIABILITY,
    category: AccountCategory.PAYABLE,
    isSystem: true,
  },
  {
    code: '6000',
    name: 'General & Administrative Expenses',
    type: AccountType.EXPENSE,
    category: AccountCategory.OPERATING_EXPENSE,
    isSystem: false,
  },
  {
    code: '8000',
    name: 'Foreign Exchange Gain/Loss',
    type: AccountType.EXPENSE,
    category: AccountCategory.OPERATING_EXPENSE,
    isSystem: true,
  },
]

export const IFRS_COA = [
  {
    code: '1000',
    name: 'Cash and Cash Equivalents',
    type: AccountType.ASSET,
    category: AccountCategory.CASH_BANK,
    isSystem: true,
  },
  {
    code: '1100',
    name: 'Inventories',
    type: AccountType.ASSET,
    category: AccountCategory.INVENTORY,
    isSystem: true,
  },
  {
    code: '1200',
    name: 'Trade Receivables',
    type: AccountType.ASSET,
    category: AccountCategory.RECEIVABLE,
    isSystem: true,
  },
  {
    code: '2100',
    name: 'Trade Payables',
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
    name: 'Revenue from Contracts with Customers',
    type: AccountType.REVENUE,
    category: AccountCategory.SALES,
    isSystem: true,
  },
  {
    code: '5000',
    name: 'Cost of Sales',
    type: AccountType.EXPENSE,
    category: AccountCategory.COGS,
    isSystem: true,
  },
  {
    code: '5100',
    name: 'Refund and Return Expenses',
    type: AccountType.EXPENSE,
    category: AccountCategory.OPERATING_EXPENSE,
    isSystem: true,
  },
  {
    code: '2300',
    name: 'Customer Wallet Liabilities',
    type: AccountType.LIABILITY,
    category: AccountCategory.OTHER,
    isSystem: true,
  },
  {
    code: '2200',
    name: 'Output VAT Liability',
    type: AccountType.LIABILITY,
    category: AccountCategory.PAYABLE,
    isSystem: true,
  },
  {
    code: '1300',
    name: 'Input VAT Credit',
    type: AccountType.ASSET,
    category: AccountCategory.RECEIVABLE,
    isSystem: true,
  },
  {
    code: '6000',
    name: 'Distribution and Administrative Expenses',
    type: AccountType.EXPENSE,
    category: AccountCategory.OPERATING_EXPENSE,
    isSystem: false,
  },
  {
    code: '8000',
    name: 'Foreign Exchange Gain/Loss',
    type: AccountType.EXPENSE,
    category: AccountCategory.OPERATING_EXPENSE,
    isSystem: true,
  },
]

export const BAS_COA = [
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
    code: '5100',
    name: 'Refund Expense',
    type: AccountType.EXPENSE,
    category: AccountCategory.OPERATING_EXPENSE,
    isSystem: true,
  },
  {
    code: '2300',
    name: 'Customer Wallet Liabilities',
    type: AccountType.LIABILITY,
    category: AccountCategory.OTHER,
    isSystem: true,
  },
  {
    code: '2200',
    name: 'Sales Tax Liability',
    type: AccountType.LIABILITY,
    category: AccountCategory.PAYABLE,
    isSystem: true,
  },
  {
    code: '6000',
    name: 'Operating Expenses',
    type: AccountType.EXPENSE,
    category: AccountCategory.OPERATING_EXPENSE,
    isSystem: false,
  },
  {
    code: '8000',
    name: 'Foreign Exchange Gain/Loss',
    type: AccountType.EXPENSE,
    category: AccountCategory.OPERATING_EXPENSE,
    isSystem: true,
  },
]

export const DEFAULT_CHART_OF_ACCOUNTS = BAS_COA

export function getChartOfAccounts(standard?: string) {
  const norm = standard?.toUpperCase()
  if (norm === 'US-GAAP') {
    return US_GAAP_COA
  }
  if (norm === 'IFRS') {
    return IFRS_COA
  }
  return BAS_COA
}
