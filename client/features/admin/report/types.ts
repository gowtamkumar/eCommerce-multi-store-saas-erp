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

export interface SalesReportProps {
    data: SalesDashboardData | null;
    isLoading: boolean;
    period: string;
    onPeriodChange: (period: string) => void;
    onExport: () => void;
}
