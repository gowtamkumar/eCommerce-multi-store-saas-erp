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

export interface RecentProduct {
    id: string;
    name: string;
    createdAt: string;
    price: number;
    stock: number;
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
    recentProducts: RecentProduct[];
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

export interface SalesTrendChartProps {
    salesData: SalesTrendPoint[];
    isLoading: boolean;
}

export interface RecentProductsTableProps {
    products: RecentProduct[];
    isLoading: boolean;
}

export interface ProfitLossKpiGridProps {
    data?: ProfitLossData | null;
    isLoading: boolean;
    formatPrice: (price: number) => string;
}

export interface FinancialStatementProps {
    data?: ProfitLossData | null;
    isLoading: boolean;
    formatPrice: (price: number) => string;
}


export interface FinanceSupplyChainCardProps {
    stats?: SupplierStats;
    payoutsDue: number;
    isLoading: boolean;
    formatPrice: (price: number) => string;
}

export interface FinanceKpiGridProps {
    kpis?: FinanceKpis;
    isLoading: boolean;
    formatPrice: (price: number) => string;
}

export interface ReportExportSettingsProps {
    reportType: string;
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    suppliers: any[];
    selectedSupplierId: string;
    onSupplierChange: (id: string) => void;
    customers: any[];
    selectedCustomerId: string;
    onCustomerChange: (id: string) => void;
    onExport: () => void;
    isLoading: boolean;
}

export interface CustomerLedgerHeaderProps {
    customers: any[];
    selectedCustomerId: string;
    onCustomerChange: (id: string) => void;
    hasLedgerData: boolean;
    onExportCsv?: () => void;
    isExporting?: boolean;
}

export interface CustomerLedgerSummaryProps {
    summary: LedgerSummary;
    formatPrice: (price: number) => string;
}

interface ReportType {
    id: string;
    name: string;
    description: string;
    icon: any;
    color: string;
}

export interface ReportTypeSelectionProps {
    reports: ReportType[];
    currentType: string;
    onTypeChange: (type: string) => void;
}

export interface CustomerLedgerTableProps {
    transactions: LedgerTransaction[];
    formatPrice: (price: number) => string;
    customerInfo: CustomerShortInfo;
}

export interface ExpenseDistributionProps {
    data?: OperatingExpensesData | null;
    isLoading: boolean;
}

export interface OutflowPieChartProps {
    data: ExpenseBreakdownPoint[];
    isLoading: boolean;
}

export interface RevenuePayoutChartProps {
    chartData: FinanceChartPoint[];
    isLoading: boolean;
}


export interface ProfitLossHeaderProps {
    startDate: string;
    endDate: string;
    onDateChange: (key: 'startDate' | 'endDate', value: string) => void;
    onFilter: () => void;
}

export interface LowStockTableProps {
    products: LowStockProduct[];
    isLoading: boolean;
}

export interface SalesStatsGridProps {
    data: SalesDashboardData | null;
    isLoading: boolean;
    formatPrice: (price: number) => string;
}

export interface SupplierLedgerHeaderProps {
    suppliers: any[];
    selectedSupplierId: string;
    onSupplierChange: (id: string) => void;
    hasLedgerData: boolean;
    onExportCsv?: () => void;
    isExporting?: boolean;
}


export interface SupplierLedgerSummaryProps {
    summary: LedgerSummary;
    formatPrice: (price: number) => string;
}

export interface SupplierLedgerTableProps {
    transactions: LedgerTransaction[];
    formatPrice: (price: number) => string;
    supplierInfo: SupplierShortInfo;
}

export interface CashFlowHeaderProps {
    onExport: () => void;
    isExporting?: boolean;
}
