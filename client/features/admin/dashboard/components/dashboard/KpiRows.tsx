'use client';

import { BarChart3, Coins, Package, ShoppingBag, Store, TrendingUp, Truck, Wallet } from 'lucide-react';
import { getPeriodLabel } from '../../lib/dashboard';
import type { DashboardPeriod, DashboardStats } from '../../types';
import StatCard from './StatCard';

export default function KpiRows({
    stats,
    loading,
    period,
    formatPrice,
}: {
    stats: DashboardStats | null;
    loading: boolean;
    period: DashboardPeriod;
    formatPrice: (value: number) => string;
}) {
    const periodLabel = getPeriodLabel(period);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label={`${periodLabel} Sales`}
                    value={stats?.periodSales || 0}
                    subValue={`${stats?.periodOrders || 0} orders this ${period}`}
                    icon={TrendingUp}
                    colorClass="text-brand-600"
                    bgClass="bg-brand-50 dark:bg-brand-900/20"
                    loading={loading}
                    isPrice
                    formatPrice={formatPrice}
                    trend={stats?.periodGrowth}
                />
                <StatCard
                    label="Active Orders"
                    value={stats?.activeOrders || 0}
                    subValue="Awaiting fulfillment"
                    icon={ShoppingBag}
                    colorClass="text-blue-600"
                    bgClass="bg-blue-50 dark:bg-blue-900/20"
                    loading={loading}
                />
                <StatCard
                    label="Inventory Alert"
                    value={stats?.lowStockCount || 0}
                    subValue="Items with low stock"
                    icon={Package}
                    colorClass="text-rose-500"
                    bgClass="bg-rose-50 dark:bg-rose-900/20"
                    loading={loading}
                />
                <StatCard
                    label="Fulfillment Status"
                    value={stats?.fulfillment?.pending || 0}
                    subValue={`${stats?.fulfillment?.picking || 0} tasks in progress`}
                    icon={Truck}
                    colorClass="text-brand-600"
                    bgClass="bg-brand-50 dark:bg-brand-900/20"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Sales"
                    value={stats?.totalSales || 0}
                    subValue="Lifetime completed revenue"
                    icon={Coins}
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-50 dark:bg-emerald-900/20"
                    loading={loading}
                    isPrice
                    formatPrice={formatPrice}
                    trend={stats?.monthlyGrowth}
                />
                <StatCard
                    label="Avg Order Value"
                    value={stats?.avgOrderValue || 0}
                    subValue={`Across ${stats?.periodOrders || 0} ${period} orders`}
                    icon={BarChart3}
                    colorClass="text-indigo-600"
                    bgClass="bg-indigo-50 dark:bg-indigo-900/20"
                    loading={loading}
                    isPrice
                    formatPrice={formatPrice}
                />
                <StatCard
                    label="Payables Due"
                    value={stats?.supplierStats?.totalAmountDue || 0}
                    subValue={`${stats?.supplierStats?.totalPurchaseOrders || 0} purchase orders`}
                    icon={Wallet}
                    colorClass="text-amber-600"
                    bgClass="bg-amber-50 dark:bg-amber-900/20"
                    loading={loading}
                    isPrice
                    formatPrice={formatPrice}
                />
                <StatCard
                    label="Suppliers"
                    value={stats?.supplierStats?.totalSuppliers || 0}
                    subValue="Active vendor accounts"
                    icon={Store}
                    colorClass="text-slate-600 dark:text-slate-300"
                    bgClass="bg-slate-100 dark:bg-slate-900/40"
                    loading={loading}
                />
            </div>
        </>
    );
}
