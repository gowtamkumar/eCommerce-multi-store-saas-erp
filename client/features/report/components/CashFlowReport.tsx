'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import dayjs from 'dayjs';
import { ArrowDownRight, ArrowUpRight, BarChart3, Calendar, Download, Filter, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function CashFlowReport() {
    const { formatPrice } = useSettings();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchReport = async () => {
        try {
            setIsLoading(true);
            const res = await fetchAPI('/report/cash-flow');
            setData(res.data);
        } catch (error) {
            toast.error('Failed to load cash flow summary');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    if (isLoading && !data) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-brand-600" />
                        Cash Flow Summary
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Unified tracking of money movement in and out of your business</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <ArrowUpRight className="w-12 h-12 text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Cash In (30d)</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatPrice(data?.summary?.totalInflow || 0)}</h3>
                    <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-bold">
                        <TrendingUp className="w-3 h-3" />
                        <span>Sales Revenue</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <ArrowDownRight className="w-12 h-12 text-rose-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Cash Out (30d)</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatPrice(data?.summary?.totalOutflow || 0)}</h3>
                    <div className="flex items-center gap-1 mt-2 text-rose-600 text-xs font-bold">
                        <TrendingDown className="w-3 h-3" />
                        <span>Expenses & Payouts</span>
                    </div>
                </div>

                <div className={`p-6 rounded-2xl border shadow-lg relative overflow-hidden ${data?.summary?.netCashFlow >= 0 ? 'bg-brand-600 border-brand-500' : 'bg-rose-600 border-rose-500'}`}>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-white/70">Net Cash Flow</p>
                        <h3 className="text-2xl font-black text-white mt-1">{formatPrice(data?.summary?.netCashFlow || 0)}</h3>
                        <p className="text-xs text-white/60 mt-2">
                            {data?.summary?.netCashFlow >= 0 ? 'Positive liquidity flow' : 'Negative liquidity flow'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Flow Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-brand-600" />
                        Liquidity Trend (Last 30 Days)
                    </h3>
                </div>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data?.chartData || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="displayDate"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                tickFormatter={(val) => `${val}`}
                            />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#fff'
                                }}
                            />
                            <Bar dataKey="inflow" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} name="Cash In" />
                            <Bar dataKey="outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={12} name="Cash Out" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Transaction Log */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white">Detailed Cash Movements</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                                <th className="p-4">Date</th>
                                <th className="p-4">Reference/Category</th>
                                <th className="p-4 text-right">Inflow</th>
                                <th className="p-4 text-right">Outflow</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {data?.recentMovements?.map((m: any, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                    <td className="p-4 whitespace-nowrap">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{dayjs(m.date).format('MMM D, YYYY')}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{m.reference || 'N/A'}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{m.category}</p>
                                    </td>
                                    <td className="p-4 text-right">
                                        {m.type === 'INFLOW' ? (
                                            <span className="text-sm font-black text-emerald-600">+{formatPrice(m.amount)}</span>
                                        ) : '-'}
                                    </td>
                                    <td className="p-4 text-right">
                                        {m.type === 'OUTFLOW' ? (
                                            <span className="text-sm font-black text-rose-600">-{formatPrice(m.amount)}</span>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
