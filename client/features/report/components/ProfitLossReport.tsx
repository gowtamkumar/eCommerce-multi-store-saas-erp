'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import dayjs from 'dayjs';
import { ArrowDownRight, ArrowUpRight, BarChart3, Calendar, Download, Filter, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ProfitLossReport() {
    const { formatPrice } = useSettings();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
    });

    const fetchReport = async () => {
        try {
            setIsLoading(true);
            const query = `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
            const res = await fetchAPI(`/report/profit-loss${query}`);
            setData(res.data);
        } catch (error) {
            toast.error('Failed to load P&L report');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        fetchReport();
    };

    if (isLoading && !data) {
        return <div className="p-8 text-center text-slate-500">Loading Report...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-brand-600" />
                        Profit & Loss Report
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Summary of revenue, COGS, and expenses</p>
                </div>

                <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                        />
                    </div>
                    <span className="text-slate-400">to</span>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Print
                    </button>
                </form>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+Revenue</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatPrice(data?.revenue?.total || 0)}</h3>
                    <p className="text-xs text-slate-400 mt-2">{data?.revenue?.orderCount || 0} Orders processed</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                            <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">-COGS</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cost of Goods Sold</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatPrice(data?.cogs?.total || 0)}</h3>
                    <p className="text-xs text-slate-400 mt-2">{data?.cogs?.purchaseOrderCount || 0} Purchase orders</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
                            <ArrowDownRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">-Expenses</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Operating Expenses</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatPrice(data?.operatingExpenses?.total || 0)}</h3>
                    <p className="text-xs text-slate-400 mt-2">Staff, utilities & others</p>
                </div>

                <div className="bg-brand-600 p-6 rounded-2xl shadow-lg shadow-brand-500/20 text-white">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <ArrowUpRight className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">{data?.profitMargin?.toFixed(1)}% Margin</span>
                    </div>
                    <p className="text-sm font-medium text-white/80">Net Profit</p>
                    <h3 className="text-2xl font-bold mt-1">{formatPrice(data?.netProfit || 0)}</h3>
                    <p className="text-xs text-white/60 mt-2">Final bottom line</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Detailed P&L Statement */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Financial Statement</h3>
                        <p className="text-sm text-slate-500">Summary for {dayjs(data?.period?.startDate).format('MMM D')} to {dayjs(data?.period?.endDate).format('MMM D, YYYY')}</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700/50">
                            <span className="text-slate-600 dark:text-slate-300 font-medium">Sales Revenue</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatPrice(data?.revenue?.total || 0)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700/50">
                            <span className="text-slate-600 dark:text-slate-300">Cost of Goods Sold (COGS)</span>
                            <span className="text-orange-600 dark:text-orange-400 font-medium">({formatPrice(data?.cogs?.total || 0)})</span>
                        </div>
                        <div className="flex justify-between py-3 bg-slate-50 dark:bg-slate-900/50 px-4 rounded-xl">
                            <span className="text-slate-900 dark:text-white font-bold">Gross Profit</span>
                            <span className="text-slate-900 dark:text-white font-bold text-lg">{formatPrice(data?.grossProfit || 0)}</span>
                        </div>

                        <div className="pt-4 pb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operating Expenses</span>
                        </div>

                        {data?.operatingExpenses?.breakdown?.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 pl-4">
                                <span className="text-slate-500 capitalize">{item.category.toLowerCase()}</span>
                                <span className="text-slate-700 dark:text-slate-300">({formatPrice(item.amount)})</span>
                            </div>
                        ))}

                        <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 pl-4 font-medium italic">
                            <span>Total Operating Expenses</span>
                            <span>({formatPrice(data?.operatingExpenses?.total || 0)})</span>
                        </div>

                        <div className="mt-8 p-6 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex justify-between items-center border border-brand-100 dark:border-brand-900/30">
                            <div>
                                <h4 className="text-brand-900 dark:text-brand-300 font-bold text-xl">Net Profit (Loss)</h4>
                                <p className="text-brand-600 dark:text-brand-400 text-sm">After all costs and expenses</p>
                            </div>
                            <span className={`text-2xl font-black ${data?.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {formatPrice(data?.netProfit || 0)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Expense Breakdown Pie (Simplified list for now) */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Expense Distribution</h3>

                    <div className="flex-1 space-y-6">
                        {data?.operatingExpenses?.breakdown?.slice(0, 6).map((item: any, i: number) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{item.category.toLowerCase()}</span>
                                    <span className="text-slate-500">{((item.amount / (data?.operatingExpenses?.total || 1)) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-brand-500 h-full rounded-full"
                                        style={{ width: `${(item.amount / (data?.operatingExpenses?.total || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {(!data?.operatingExpenses?.breakdown || data.operatingExpenses.breakdown.length === 0) && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                                <BarChart3 className="w-10 h-10 opacity-20" />
                                <p className="text-sm">No expenses detected in this period</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-600 text-xs text-slate-500 leading-relaxed">
                        <p><strong>Note:</strong> COGS includes all purchase orders. Operating expenses include all manual entries recorded in the Expenses module.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
