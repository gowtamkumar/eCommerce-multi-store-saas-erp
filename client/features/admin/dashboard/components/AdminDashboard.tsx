'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { useMemo } from 'react';
import { buildHealthItems } from '../lib/dashboard';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import ActionCenter from './dashboard/ActionCenter';
import CommandCenter from './dashboard/CommandCenter';
import DashboardCopilot from './dashboard/DashboardCopilot';
import AdminCopilot from './dashboard/AdminCopilot';
import DashboardHeader from './dashboard/DashboardHeader';
import ErrorBanner from './dashboard/ErrorBanner';
import FinanceSnapshot from './dashboard/FinanceSnapshot';
import KpiRows from './dashboard/KpiRows';
import LowStockGrid from './dashboard/LowStockGrid';
import PlatformHealth from './dashboard/PlatformHealth';
import RecentOrders from './dashboard/RecentOrders';
import RecentPurchases from './dashboard/RecentPurchases';
import RevenueExpenseChart from './dashboard/RevenueExpenseChart';
import SalesChart from './dashboard/SalesChart';
import TopPerformers from './dashboard/TopPerformers';

export default function AdminDashboard() {
    const { formatPrice } = useSettings();
    const {
        period,
        setPeriod,
        stats,
        loading,
        error,
        lastUpdated,
        fetchDashboardStats,
    } = useAdminDashboard();

    const healthItems = useMemo(() => buildHealthItems(stats), [stats]);

    return (
        <div className="space-y-8 pb-12">
            <DashboardHeader
                period={period}
                setPeriod={setPeriod}
                loading={loading}
                lastUpdated={lastUpdated}
                onRefresh={fetchDashboardStats}
            />

            <ErrorBanner error={error} onRetry={fetchDashboardStats} />

            <KpiRows
                stats={stats}
                loading={loading}
                period={period}
                formatPrice={formatPrice}
            />

            <DashboardCopilot period={period} />

            <AdminCopilot />

            <ActionCenter stats={stats} loading={loading} formatPrice={formatPrice} />

            <FinanceSnapshot
                snapshot={stats?.financeSnapshot}
                loading={loading}
                formatPrice={formatPrice}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <SalesChart data={stats?.salesData || []} loading={loading} period={period} />
                <div className="flex flex-col gap-6">
                    <PlatformHealth items={healthItems} />
                    <CommandCenter />
                </div>
            </div>

            <RevenueExpenseChart stats={stats} loading={loading} />
            <TopPerformers stats={stats} loading={loading} formatPrice={formatPrice} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RecentOrders stats={stats} loading={loading} formatPrice={formatPrice} />
                <RecentPurchases stats={stats} loading={loading} formatPrice={formatPrice} />
            </div>

            <LowStockGrid stats={stats} loading={loading} />
        </div>
    );
}
