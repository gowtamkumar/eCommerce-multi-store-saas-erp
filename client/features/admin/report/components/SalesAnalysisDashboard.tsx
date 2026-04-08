'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import { TrendingUp, Download } from 'lucide-react';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import type { SalesDashboardData } from '../types';
import SalesStatsGrid from './SalesStatsGrid';
import SalesTrendChart from './SalesTrendChart';
import LowStockTable from './LowStockTable';
import TopPagesTable from './TopPagesTable';

export default function SalesAnalysisDashboard() {
    const { formatPrice } = useSettings();
    const [data, setData] = useState<SalesDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    const fetchReport = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetchAPI(`/report/dashboard?period=${period}`);
            if (res && res.data) {
                setData(res.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard report:', error);
            toast.error('Failed to load sales report');
        } finally {
            setIsLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleExport = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-brand-600" />
                        Sales Analysis
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track your store performance and sales trends</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                    >
                        <option value="day">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium border border-transparent"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <SalesStatsGrid
                data={data}
                isLoading={isLoading}
                formatPrice={formatPrice}
            />

            {/* Sales Chart */}
            <SalesTrendChart
                salesData={data?.salesData || []}
                isLoading={isLoading}
            />

            {/* Tables Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                <LowStockTable
                    products={data?.lowStockProducts || []}
                    isLoading={isLoading}
                />
                <TopPagesTable
                    pages={data?.recentPages || []}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
