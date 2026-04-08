export interface SalesTrendPoint {
    name: string;
    sales: number;
}

export interface LowStockProduct {
    id: string;
    name: string;
    images?: string[];
    stock: number;
}

export interface RecentPage {
    id: string;
    title: string;
    slug: string;
    createdAt: string;
}

export interface SalesDashboardData {
    periodSales: number;
    monthlyGrowth: number | null;
    periodOrders: number;
    activeOrders: number;
    counts: {
        users: number;
    };
    salesData: SalesTrendPoint[];
    lowStockProducts: LowStockProduct[];
    recentPages: RecentPage[];
}

export interface FinanceChartPoint {
    name: string;
    revenue: number;
    expense: number;
    [key: string]: string | number;
}

export interface ExpenseBreakdownPoint {
    name: string;
    value: number;
    [key: string]: string | number;
}

export interface OperatingExpenseItem {
    category: string;
    amount: number;
}

export interface OperatingExpensesData {
    total: number;
    breakdown: OperatingExpenseItem[];
}

export interface ProfitLossData {
    revenue: {
        total: number;
        orderCount: number;
    };
    cogs: {
        total: number;
        purchaseOrderCount: number;
    };
    operatingExpenses: OperatingExpensesData;
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
    period: {
        startDate: string;
        endDate: string;
    };
}

export interface LedgerTransaction {
    type: string;
    id: string;
    date: string;
    status: string;
    reference: string;
    note?: string;
    debit: number;
    credit: number;
    balance: number;
}

export interface LedgerSummary {
    totalOrders: number;
    totalPaid: number;
    balance: number;
}

export interface SupplierShortInfo {
    id: string;
    name: string;
    email: string;
}

export interface SupplierLedgerData {
    supplier: SupplierShortInfo;
    summary: LedgerSummary;
    ledger: LedgerTransaction[];
}

export interface CustomerShortInfo {
    id: string;
    name: string;
    email: string;
}

export interface CustomerLedgerData {
    customer: CustomerShortInfo;
    summary: LedgerSummary;
    ledger: LedgerTransaction[];
}

export interface CashFlowChartItem {
    date: string;
    displayDate: string;
    inflow: number;
    outflow: number;
}

export interface CashMovement {
    date: string;
    reference: string;
    category: string;
    type: 'INFLOW' | 'OUTFLOW';
    amount: number;
}

export interface CashFlowSummary {
    totalInflow: number;
    totalOutflow: number;
    netCashFlow: number;
}

export interface CashFlowData {
    summary: CashFlowSummary;
    chartData: CashFlowChartItem[];
    recentMovements: CashMovement[];
}

export interface FinanceKpis {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    totalAmountDue: number;
    margin: number;
}

export interface SupplierStats {
    totalSuppliers: number;
    totalPurchaseOrders: number;
}

export interface FinanceDashboardData {
    kpis: FinanceKpis;
    chartData: FinanceChartPoint[];
    expenseBreakdown: ExpenseBreakdownPoint[];
    supplierStats: SupplierStats;
}

export interface SalesReportProps {
    data: SalesDashboardData | null;
    isLoading: boolean;
    period: string;
    onPeriodChange: (period: string) => void;
    onExport: () => void;
}
