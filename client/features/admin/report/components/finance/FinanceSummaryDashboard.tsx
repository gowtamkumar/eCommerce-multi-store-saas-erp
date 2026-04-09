'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { FinanceDashboardData } from '../../types';
import FinanceKpiGrid from './FinanceKpiGrid';
import FinanceQuickActions from './FinanceQuickActions';
import FinanceSupplyChainCard from './FinanceSupplyChainCard';
import OutflowPieChart from './OutflowPieChart';
import RevenuePayoutChart from './RevenuePayoutChart';

export default function FinanceSummaryDashboard() {
    const { formatPrice } = useSettings();
    const [data, setData] = useState<FinanceDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetchAPI('/report/finance-summary');
            if (res && res.data) {
                setData(res.data);
            }
        } catch (error) {
            console.error('Error loading finance summary:', error);
            toast.error('Failed to load finance dashboard');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display">Finance Summary</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time health of your business finances</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
                    >
                        Total Analytics
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <FinanceKpiGrid
                kpis={data?.kpis}
                isLoading={isLoading}
                formatPrice={formatPrice}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Revenue vs Expense Chart */}
                <div className="lg:col-span-3">
                    <RevenuePayoutChart
                        chartData={data?.chartData || []}
                        isLoading={isLoading}
                    />
                </div>

                {/* Supply Chain & Outflow */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <FinanceSupplyChainCard
                        stats={data?.supplierStats}
                        payoutsDue={data?.kpis?.totalAmountDue || 0}
                        isLoading={isLoading}
                        formatPrice={formatPrice}
                    />

                    <OutflowPieChart
                        data={data?.expenseBreakdown || []}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            {/* Quick Actions & Navigation */}
            <FinanceQuickActions />
        </div>
    );
}
