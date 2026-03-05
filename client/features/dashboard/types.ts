export interface DashboardStats {
    totalSales: number;
    periodSales: number;
    periodOrders: number;
    activeOrders: number;
    totalProducts: number;
    totalPages: number;
    recentPages: any[];
    salesData: any[];
    monthlyGrowth: number | null;
    supplierStats?: {
        totalSuppliers: number;
        totalPurchaseOrders: number;
        totalAmountDue: number;
        recentPurchaseOrders: any[];
    };
}
