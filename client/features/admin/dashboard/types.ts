export interface DashboardStats {
    totalSales: number;
    periodSales: number;
    periodOrders: number;
    activeOrders: number;
    totalProducts: number;
    totalPages: number;
    recentProducts: any[];
    recentOrders?: any[];
    salesData: any[];
    monthlyGrowth: number | null;
    periodGrowth?: number | null;
    avgOrderValue?: number;
    supplierStats?: {
        totalSuppliers: number;
        totalPurchaseOrders: number;
        totalAmountDue: number;
        recentPurchaseOrders: any[];
    };
    lowStockCount?: number;
    lowStockProducts?: any[];
    counts?: {
        users: number;
        products: number;
        orders: number;
        pages: number;
        suppliers?: number;
        purchaseOrders?: number;
    };
    fulfillment?: {
        pending: number | string;
        picking: number | string;
    };
}
