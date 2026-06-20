'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { useMemo, useState, useEffect } from 'react';
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
import { LayoutDashboard, Coins, Activity, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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

    const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'operations' | 'copilots'>('overview');

    useEffect(() => {
        const saved = localStorage.getItem('admin:dashboardActiveTab');
        if (saved === 'overview' || saved === 'financials' || saved === 'operations' || saved === 'copilots') {
            setActiveTab(saved);
        }
    }, []);

    const handleTabChange = (tab: 'overview' | 'financials' | 'operations' | 'copilots') => {
        setActiveTab(tab);
        localStorage.setItem('admin:dashboardActiveTab', tab);
    };

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

            {/* Premium Tab Navigation */}
            <div className="bg-slate-100/80 dark:bg-slate-900/60 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-nowrap overflow-x-auto scrollbar-none gap-1 max-w-full">
                {[
                    { id: 'overview', label: 'Overview', icon: LayoutDashboard, color: 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/20' },
                    { id: 'financials', label: 'Financials & Sales', icon: Coins, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' },
                    { id: 'operations', label: 'Operations', icon: Activity, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20' },
                    { id: 'copilots', label: 'AI Assistants', icon: Sparkles, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20' },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id as any)}
                            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 ${
                                isActive
                                    ? `bg-white dark:bg-slate-800 shadow-md ${tab.color.split(' ')[0]} font-extrabold`
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-slate-800/30'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? tab.color.split(' ')[0] : 'text-slate-400 dark:text-slate-500'}`} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <KpiRows
                                    stats={stats}
                                    loading={loading}
                                    period={period}
                                    formatPrice={formatPrice}
                                />

                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                    <SalesChart data={stats?.salesData || []} loading={loading} period={period} />
                                    <div className="flex flex-col gap-6">
                                        <PlatformHealth items={healthItems} />
                                        <CommandCenter />
                                    </div>
                                </div>

                                <LowStockGrid stats={stats} loading={loading} />
                            </div>
                        )}

                        {activeTab === 'financials' && (
                            <div className="space-y-8">
                                <FinanceSnapshot
                                    snapshot={stats?.financeSnapshot}
                                    loading={loading}
                                    formatPrice={formatPrice}
                                />
                                <RevenueExpenseChart stats={stats} loading={loading} />
                                <TopPerformers stats={stats} loading={loading} formatPrice={formatPrice} />
                            </div>
                        )}

                        {activeTab === 'operations' && (
                            <div className="space-y-8">
                                <ActionCenter stats={stats} loading={loading} formatPrice={formatPrice} />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <RecentOrders stats={stats} loading={loading} formatPrice={formatPrice} />
                                    <RecentPurchases stats={stats} loading={loading} formatPrice={formatPrice} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'copilots' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <DashboardCopilot period={period} />
                                <AdminCopilot />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
