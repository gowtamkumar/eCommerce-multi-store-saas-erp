export interface LedgerEntry {
    id: string;
    createdAt: string;
    type: string;
    quantity: number;
    unitCost: number;
    cogsAmount: number;
    balanceAfter: number;
    remainingQuantity: number;
    referenceType: string;
    referenceId: string;
    remarks: string;
    product?: { name: string; images?: string[] };
    warehouse?: { name: string };
    user?: { name: string };
}

export interface GLJournalLine {
    id: string;
    side: 'DEBIT' | 'CREDIT';
    amount: number;
    balanceAfter: number;
    account: {
        code: string;
        name: string;
        type: string;
    };
}

export interface GLJournalEntry {
    id: string;
    date: string;
    type: string;
    description: string;
    referenceType: string;
    referenceId: string;
    totalAmount: number;
    isReversal: boolean;
    reversedJournalEntryId: string;
    lines: GLJournalLine[];
}

export interface FormLine {
    accountCode: string;
    side: 'DEBIT' | 'CREDIT';
    amount: string;
}

/**
 * Flattened row used by the financial journals table. A row is either a parent
 * journal entry (`isParent`) or one of its expanded lines (`isLine`); the
 * optional fields below cover both shapes so cells can branch on the flags.
 */
export interface GlTableRow {
    id: string;
    isParent?: boolean;
    isExpanded?: boolean;
    isLine?: boolean;
    parentId?: string;
    // Parent journal fields
    date?: string;
    createdAt?: string;
    type?: string;
    description?: string;
    isReversal?: boolean;
    reversedJournalEntryId?: string | null;
    referenceType?: string;
    referenceId?: string;
    totalAmount?: number;
    lines?: GLJournalLine[];
    // Line fields
    account?: { code: string; name: string; type?: string };
    side?: 'DEBIT' | 'CREDIT';
    amount?: number;
    balanceAfter?: number;
}

export interface DunningRule {
    id: string;
    dunningLevel: number;
    daysOverdue: number;
    action: 'EMAIL' | 'CREDIT_HOLD' | 'EMAIL_AND_HOLD';
    emailSubject: string;
    emailBody: string;
}

export interface DunningLog {
    id: string;
    createdAt: string;
    actionTaken: 'EMAIL' | 'CREDIT_HOLD' | 'EMAIL_AND_HOLD';
    recipientEmail: string;
    emailSubject: string | null;
    emailBody: string | null;
    triggeredDaysOverdue: number;
    triggeredAmountOverdue: number;
    customer: {
        id: string;
        name: string;
        companyName: string | null;
    };
    dunningRule: {
        dunningLevel: number;
        daysOverdue: number;
    };
}

export type ApTab = 'aging' | 'batch-payment';

export interface ApAgingRow {
    supplierId: string;
    supplierName: string;
    email: string;
    phone: string;
    totalOutstanding: number;
    aging: {
        current: number;
        '1-30': number;
        '31-60': number;
        '61-90': number;
        '90+': number;
    };
}

export interface UnpaidInvoice {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    paidAmount: number;
    status: string;
    matchStatus: string;
    supplierId: string;
    supplier?: {
        name: string;
    };
}

export interface BatchPaymentResultLine {
    invoiceNumber: string;
    amountPaid: number;
}

export interface BatchPaymentResult {
    processedCount: number;
    failedCount: number;
    payments?: BatchPaymentResultLine[];
}

export interface BalanceSheetLineItem {
    name: string;
    balance: number;
}

export interface BalanceSheetData {
    assets: BalanceSheetLineItem[];
    totalAssets: number;
    liabilities: BalanceSheetLineItem[];
    totalLiabilities: number;
    equity: BalanceSheetLineItem[];
    totalEquity: number;
}

export type BalanceSheetSectionKey = 'assets' | 'liabilities' | 'equity';
export type BalanceSheetTotalKey = 'totalAssets' | 'totalLiabilities' | 'totalEquity';

export interface AccountBreakdown {
    code: string;
    name: string;
    category: string;
    balance: number;
}

export interface ProfitLossSummary {
    revenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    operatingExpenses: number;
    netProfit: number;
}

export interface PLData extends ProfitLossSummary {
    revenueBreakdown: AccountBreakdown[];
    cogsBreakdown: AccountBreakdown[];
    operatingExpBreakdown: AccountBreakdown[];
}

export type ProfitLossPreset = 'month' | 'quarter' | 'year' | 'all';

export type FinancialView = 'overview' | 'balance';

export interface WalletCustomerRow {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    walletBalance?: number;
}

export type WalletAdjustmentType = 'credit' | 'debit';

export interface ChartAccount {
    id: string;
    code: string;
    name: string;
    type: string;
    category: string;
    balance: number;
    isSystem: boolean;
}

export interface ChartAccountFormData {
    code: string;
    name: string;
    type: string;
    category: string;
}

export interface CashFlowSegment {
    inflows: number;
    outflows: number;
    net: number;
}

export type CashFlowSegmentKey = 'operating' | 'investing' | 'financing';

export interface CashFlowReport {
    operating: CashFlowSegment;
    investing: CashFlowSegment;
    financing: CashFlowSegment;
    netChange: number;
    startingBalance: number;
    endingBalance: number;
}

export type FiscalPeriodStatus = 'OPEN' | 'CLOSED';

export interface FiscalPeriod {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
}

export interface FiscalPeriodFormData {
    name: string;
    startDate: string;
    endDate: string;
}

export type TaxVatTab = 'filing' | 'rules' | 'sandbox';

export interface TaxRule {
    id: string;
    name: string;
    rate: number;
    country: string;
    state: string | null;
    category: string;
    isActive: boolean;
    isSystem: boolean;
}

export interface TaxRuleFormData {
    name: string;
    rate: string;
    country: string;
    state: string;
    category: string;
}

export interface TaxFilingLog {
    date: string;
    voucherId: string;
    description: string;
    type: string;
    taxableBase: number;
    taxRate: number;
    taxAmount: number;
}

export interface TaxFilingData {
    taxableSales: number;
    outputTaxCollected: number;
    taxablePurchases: number;
    inputTaxCredit: number;
    netTaxLiability: number;
    filingPeriod: {
        startDate: string;
        endDate: string;
    };
    transactionLogs: TaxFilingLog[];
}

export interface TaxCalculationFormData {
    country: string;
    state: string;
    category: string;
    amount: string;
}

export interface TaxCalculationResult {
    ruleName: string;
    baseAmount: number;
    taxAmount: number;
    totalAmount: number;
    rate: number;
}
