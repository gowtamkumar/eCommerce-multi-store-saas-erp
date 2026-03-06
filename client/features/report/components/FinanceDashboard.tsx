'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import {
    ArrowRight,
    Banknote,
    BarChart3,
    Briefcase,
    ChevronRight,
    CreditCard,
    DollarSign,
    LayoutDashboard,
    PieChart,
    TrendingUp,
    Wallet
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart as RechartsPieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

export default function FinanceDashboard() {
    const { formatPrice } = useSettings();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const res = await fetchAPI('/report/finance-summary');
            setData(res.data);
        } catch (error) {
            toast.error('Failed to load finance dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (isLoading && !data) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display">Finance Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time health of your business finances</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold shadow-sm">
                        This Month
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Revenue</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatPrice(data?.kpis?.totalRevenue || 0)}</h3>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mb-4">
                        <Wallet className="w-6 h-6 text-rose-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Expenses</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatPrice(data?.kpis?.totalExpenses || 0)}</h3>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
                        <DollarSign className="w-6 h-6 text-emerald-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Net Profit</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatPrice(data?.kpis?.netProfit || 0)}</h3>
                </div>

                <div className="bg-brand-600 p-6 rounded-3xl border border-brand-500 shadow-lg shadow-brand-500/20 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-12 h-12" />
                    </div>
                    <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Profit Margin</p>
                    <h3 className="text-3xl font-black mt-1">{data?.kpis?.margin?.toFixed(1)}%</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue vs Expense Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-brand-600" />
                            Revenue vs Payouts
                        </h3>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.chartData || []}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(val) => `${val}`} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorExp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                        <PieChart className="w-6 h-6 text-orange-500" />
                        Outflow Distribution
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={data?.expenseBreakdown || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {(data?.expenseBreakdown || []).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 space-y-3">
                        {data?.expenseBreakdown?.slice(0, 4).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                                </div>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{formatPrice(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions & Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/reports/profit-loss" className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-brand-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white">P&L Detailed</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Revenue vs COGS Breakdown</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-600" />
                    </div>
                </Link>

                <Link href="/admin/reports/cash-flow" className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white">Cash Flow</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Liquidity & Wallet Trends</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600" />
                    </div>
                </Link>

                <Link href="/admin/reports/export" className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 dark:text-white">Tax & Exports</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Download Finance CSVs</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-600" />
                    </div>
                </Link>
            </div>
        </div>
    );
}
