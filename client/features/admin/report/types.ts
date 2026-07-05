import type { LucideIcon } from 'lucide-react';

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

export type SalesReportPeriod = 'day' | 'week' | 'month';

export interface SalesReportDateRange {
    startDate: string;
    endDate: string;
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
    period: SalesReportPeriod;
    onPeriodChange: (period: SalesReportPeriod) => void;
    onExport: () => void;
}

export interface SalesAnalysisHeaderProps {
    period: SalesReportPeriod;
    isExporting: boolean;
    onPeriodChange: (period: SalesReportPeriod) => void;
    onExport: () => void;
    currencyCode?: string;
    currencySymbol?: string;
}

export interface SalesTrendChartProps {
    salesData: SalesTrendPoint[];
    isLoading: boolean;
    formatPrice: (price: number) => string;
    currencySymbol: string;
}

export interface RecentProductsTableProps {
    products: RecentProduct[];
    isLoading: boolean;
}

export interface SalesTablesSectionProps {
    lowStockProducts: LowStockProduct[];
    recentProducts: RecentProduct[];
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

export interface ProfitLossKpiCardConfig {
    key: string;
    label: string;
    icon: LucideIcon;
    iconWrapperClassName: string;
    iconClassName: string;
    badgeLabel: (data?: ProfitLossData | null) => string;
    badgeClassName: string;
    getValue: (data?: ProfitLossData | null) => number;
    subtitle: (data?: ProfitLossData | null) => string;
    variant?: 'default' | 'highlight';
}

export interface ProfitLossKpiCardProps {
    config: ProfitLossKpiCardConfig;
    data?: ProfitLossData | null;
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

export interface FinanceSummaryHeaderProps {
    onRefresh: () => void;
    isLoading: boolean;
    currencyCode?: string;
    currencySymbol?: string;
}

export interface FinanceKpiCardConfig {
    key: keyof FinanceKpis;
    label: string;
    icon: LucideIcon;
    iconWrapperClassName: string;
    iconClassName: string;
    cardClassName?: string;
    valueClassName?: string;
    formatValue?: (value: number, formatPrice: (price: number) => string) => string;
    progressValue?: (value: number) => number;
}

export interface FinanceKpiCardProps {
    config: FinanceKpiCardConfig;
    kpis?: FinanceKpis;
    formatPrice: (price: number) => string;
}

export interface FinanceQuickAction {
    href: string;
    icon: LucideIcon;
    title: string;
    description: string;
    bgColor: string;
    iconColor: string;
    borderColor: string;
    hoverIconColor: string;
}

export interface ReportExportPartyOption {
    id: string;
    name?: string;
    email?: string;
}

export interface ReportExportHeaderProps {
    currencyCode?: string;
    currencySymbol?: string;
}

export interface ReportExportSettingsProps {
    reportType: string;
    startDate: string;
    endDate: string;
    currencyCode?: string;
    currencySymbol?: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    suppliers: ReportExportPartyOption[];
    selectedSupplierId: string;
    onSupplierChange: (id: string) => void;
    customers: ReportExportPartyOption[];
    selectedCustomerId: string;
    onCustomerChange: (id: string) => void;
    onExport: () => void;
    isLoading: boolean;
}

export interface CustomerOption {
    id: string;
    firstName?: string;
    lastName?: string;
}

export interface CustomerLedgerHeaderProps {
    customers: CustomerOption[];
    selectedCustomerId: string;
    onCustomerChange: (id: string) => void;
    hasLedgerData: boolean;
    currencyCode?: string;
    currencySymbol?: string;
    onExportCsv?: () => void;
    isExporting?: boolean;
}

export interface CustomerLedgerSummaryProps {
    summary: LedgerSummary;
    formatPrice: (price: number) => string;
}

export interface ReportTypeOption {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
}

export interface ReportTypeSelectionProps {
    reports: ReportTypeOption[];
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
    formatPrice: (price: number) => string;
}

export interface OutflowPieChartProps {
    data: ExpenseBreakdownPoint[];
    isLoading: boolean;
    formatPrice: (price: number) => string;
}

export interface RevenuePayoutChartProps {
    chartData: FinanceChartPoint[];
    isLoading: boolean;
    formatPrice: (price: number) => string;
    currencySymbol: string;
}


export interface ProfitLossHeaderProps {
    startDate: string;
    endDate: string;
    onDateChange: (key: 'startDate' | 'endDate', value: string) => void;
    onFilter: () => void;
    currencyCode?: string;
    currencySymbol?: string;
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

export interface SupplierOption {
    id: string;
    name: string;
}

export interface SupplierLedgerHeaderProps {
    suppliers: SupplierOption[];
    selectedSupplierId: string;
    onSupplierChange: (id: string) => void;
    hasLedgerData: boolean;
    currencyCode?: string;
    currencySymbol?: string;
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

export interface CashFlowKpiGridProps {
    summary: CashFlowSummary;
    formatPrice: (price: number) => string;
}

export interface CashFlowKpiCardConfig {
    key: 'totalInflow' | 'totalOutflow';
    label: string;
    cornerIcon: LucideIcon;
    cornerIconClassName: string;
    badgeIcon: LucideIcon;
    badgeLabel: string;
    badgeClassName: string;
}

export interface WarehouseBranchRef {
    id: string;
    name: string;
    branchId?: string;
    branch?: { id: string; name?: string };
}

export interface WarehouseStockVariant {
    id: string;
    sku: string;
    price: number;
    stock: number;
    reservedStock?: number;
    lowStockThreshold?: number;
    combination?: Record<string, string>;
    lowStock?: boolean;
    outOfStock?: boolean;
}

export interface WarehouseStockProduct {
    id: string;
    name: string;
    price: number;
    stock: number;
    stockValue: number;
    reservedStock?: number;
    lowStockThreshold?: number;
    categoryName?: string;
    supplierName?: string;
    images?: string[];
    hasVariants?: boolean;
    variants?: WarehouseStockVariant[];
    lowStock?: boolean;
    outOfStock?: boolean;
}

export type WarehouseStockFilter = 'all' | 'inStock' | 'lowStock' | 'outOfStock';

export interface WarehouseStockStats {
    totalProducts: number;
    totalValue: number;
    outOfStockCount: number;
    lowStockCount: number;
    inStockCount: number;
}

export interface WarehouseStockTableRow extends Partial<WarehouseStockProduct>, Partial<WarehouseStockVariant> {
    id: string;
    isParent?: boolean;
    isVariant?: boolean;
    parentProduct?: WarehouseStockProduct;
}

export interface WarehouseStockSummaryCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    colorClass: string;
    borderClass?: string;
}

export interface WarehouseStockSummaryCardsProps {
    stats: WarehouseStockStats;
    formatPrice: (price: number) => string;
    currencyCode?: string;
}

export interface WarehouseStockHeaderProps {
    branches: WarehouseBranchRef[];
    warehouses: WarehouseBranchRef[];
    selectedBranchId: string;
    selectedWarehouseId: string;
    isExportDisabled: boolean;
    currencyCode?: string;
    currencySymbol?: string;
    onBranchChange: (branchId: string) => void;
    onWarehouseChange: (warehouseId: string) => void;
    onExport: () => void;
}

export interface WarehouseStockFilterCount {
    key: WarehouseStockFilter;
    label: string;
    count: number;
}

export interface WarehouseStockFiltersProps {
    filterCounts: WarehouseStockFilterCount[];
    activeFilter: WarehouseStockFilter;
    searchQuery: string;
    onFilterChange: (filter: WarehouseStockFilter) => void;
    onSearchChange: (value: string) => void;
}

export type CampaignChannel = 'email' | 'sms' | 'push' | string;

export interface MarketingCampaign {
    id?: string;
    name: string;
    type: CampaignChannel;
    status: string;
    sentCount?: number;
    failedCount?: number;
    totalAudience?: number;
}

export interface MarketingCoupon {
    id?: string;
    code: string;
    isActive?: boolean;
    usedCount?: number;
    usageLimit?: number | null;
    discountType?: string;
    amount: number;
}

export interface MarketingOrderItem {
    discountAmount?: number | string;
    quantity?: number;
}

export interface MarketingOrder {
    couponDiscountAmount?: number | string;
    items?: MarketingOrderItem[];
}

export interface LoyaltyConfig {
    pointsPerCurrencySpent?: number;
    pointsRequiredPerCurrencyDiscount?: number;
}

export interface LoyaltyRule {
    name?: string;
    ruleType?: string;
    pointsAwarded?: number;
    rewardPoints?: number;
}

export interface MarketingCustomer {
    id?: string;
    name?: string;
    email?: string;
    customerName?: string;
    customerEmail?: string;
    membershipTier?: string;
    loyaltyPointsBalance?: number;
}

export interface MarketingDiscountTotals {
    couponDiscountTotal: number;
    promoDiscountTotal: number;
    totalSaved: number;
}

export interface MarketingMetrics {
    totalCampaigns: number;
    totalReach: number;
    deliverySuccessRate: number;
    totalCoupons: number;
    activeCoupons: number;
    totalRedemptions: number;
    totalPointsHeld: number;
}
