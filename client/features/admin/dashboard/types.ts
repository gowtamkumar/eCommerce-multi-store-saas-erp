import type { Product } from '@/types/product';
import type { ComponentType } from 'react';

export type DashboardPeriod = 'day' | 'week' | 'month';
export type DashboardIcon = ComponentType<{ className?: string; strokeWidth?: number }>;
export type ActionTone = 'rose' | 'amber' | 'blue' | 'emerald' | 'slate';

export type HealthItem = {
    label: string;
    val: number;
    color: string;
    pct: number;
};

export type ActionCenterItem = {
    label: string;
    value: string | number;
    detail: string;
    href: string;
    icon: DashboardIcon;
    tone: ActionTone;
};

export interface DashboardStats {
    totalSales: number;
    periodSales: number;
    periodOrders: number;
    activeOrders: number;
    totalProducts: number;
    totalPages: number;
    recentProducts: Product[];
    recentOrders?: Array<{
        id: string;
        customerName?: string;
        totalAmount: number;
        status: string;
    }>;
    topProducts?: Array<{
        id: string;
        name: string;
        image?: string;
        quantity: number;
        revenue: number;
    }>;
    topCustomers?: Array<{
        id: string;
        name: string;
        email?: string | null;
        orderCount: number;
        revenue: number;
    }>;
    salesData: Array<{
        name: string;
        sales: number;
    }>;
    monthlyGrowth: number | null;
    periodGrowth?: number | null;
    avgOrderValue?: number;
    financeSnapshot?: {
        revenue: number;
        cogs: number;
        grossProfit: number;
        operatingExpenses: number;
        netProfit: number;
        profitMargin: number;
    };
    supplierStats?: {
        totalSuppliers: number;
        totalPurchaseOrders: number;
        totalAmountDue: number;
        recentPurchaseOrders: Array<{
            id: string;
            referenceNumber: string;
            totalAmount: number;
            status: string;
            supplier?: {
                name?: string;
            };
        }>;
    };
    lowStockCount?: number;
    lowStockProducts?: Array<{
        id: string;
        name: string;
        image?: string;
        stock: number;
        threshold: number;
        variantName?: string | null;
    }>;
    counts?: {
        users: number;
        products: number;
        orders: number;
        pages: number;
        suppliers?: number;
        purchaseOrders?: number;
    };
    fulfillment?: {
        pending: number;
        picking: number;
    };
}
