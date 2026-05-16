'use client';
import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import { motion } from 'framer-motion';
import { Activity, BarChart3, CheckCircle2, History as HistoryIcon, Package, Plus, ShoppingBag, Store, TrendingUp, Truck, Users } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardStats } from '../types';

// Memoized Stat Card Component
const StatCard = React.memo(({
    label,
    value,
    subValue,
    icon: Icon,
    colorClass,
    bgClass,
    borderColorClass,
    loading,
    isPrice = false,
    formatPrice
}: any) => (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-lg hover:${borderColorClass} group`}>
        <div className="flex items-center justify-between mb-4">
            <div>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                    {label}
                </p>
                {loading ? (
                    <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                ) : (
                    <h3 className={`text-2xl font-black ${colorClass || 'text-slate-900 dark:text-white'} font-mono`}>
                        {isPrice ? formatPrice(value) : value}
                    </h3>
                )}
            </div>
            <div className={`p-3 ${bgClass} rounded-2xl group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${colorClass.replace('text-', 'text-').replace('dark:text-', 'text-')}`} />
            </div>
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
            {subValue}
        </div>
    </div>
));

StatCard.displayName = 'StatCard';

// Memoized Chart Widget
const SalesChart = React.memo(({ data, loading }: any) => (
    <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter italic">
                    <TrendingUp className="w-6 h-6 text-brand-500" /> Sales Velocity
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Transaction flow performance</p>
            </div>
        </div>
        <div className="h-[400px] w-full mt-4">
            {loading ? (
                <div className="w-full h-full bg-slate-50 dark:bg-slate-900/30 animate-pulse rounded-[32px]"></div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                            dy={15}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                borderRadius: '24px',
                                border: 'none',
                                boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                                color: '#fff',
                                padding: '20px'
                            }}
                            itemStyle={{ color: '#3b82f6', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="sales"
                            stroke="#3b82f6"
                            strokeWidth={6}
                            fillOpacity={1}
                            fill="url(#colorSales)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    </div>
));

SalesChart.displayName = 'SalesChart';

export default function AdminDashboard() {
    const { formatPrice } = useSettings();
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardStats = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetchAPI(`/report/dashboard?period=${period}`);
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    const dashboardData = useMemo(() => {
        if (!stats) return null;
        return {
            ...stats,
            healthItems: [
                { label: 'Users', val: stats.counts?.users || 0, color: 'bg-indigo-500' },
                { label: 'Products', val: stats.counts?.products || 0, color: 'bg-emerald-500' },
                { label: 'Orders', val: stats.counts?.orders || 0, color: 'bg-amber-500' },
                { label: 'Pages', val: stats.counts?.pages || 0, color: 'bg-blue-500' },
            ],
            platformStats: [
                { label: 'Merchant Users', value: stats.counts?.users || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-500/20' },
                { label: 'Total Products', value: stats.counts?.products || 0, icon: Store, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-500/20' },
                { label: 'Customer Orders', value: stats.counts?.orders || 0, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-500/20' },
                { label: 'Store Pages', value: stats.counts?.pages || 0, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-500/20' },
            ]
        };
    }, [stats]);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display flex items-center gap-3">
                        Dashboard <span className="text-brand-600 italic">Overview</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time performance metrics</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                        {(['day', 'week', 'month'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${period === p
                                    ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Operational Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label={`${period} Sales`}
                    value={stats?.periodSales || 0}
                    subValue={`${stats?.periodOrders || 0} orders this ${period}`}
                    icon={TrendingUp}
                    colorClass="text-brand-600"
                    bgClass="bg-brand-50 dark:bg-brand-900/20"
                    borderColorClass="border-brand-500/20"
                    loading={loading}
                    isPrice={true}
                    formatPrice={formatPrice}
                />

                <StatCard
                    label="Active Orders"
                    value={stats?.activeOrders || 0}
                    subValue="Awaiting fulfillment"
                    icon={ShoppingBag}
                    colorClass="text-blue-600 font-mono"
                    bgClass="bg-blue-50 dark:bg-blue-900/20"
                    borderColorClass="border-blue-500/20"
                    loading={loading}
                />

                <StatCard
                    label="Inventory Alert"
                    value={stats?.lowStockCount || 0}
                    subValue="Items with low stock"
                    icon={Package}
                    colorClass="text-rose-500 font-mono"
                    bgClass="bg-rose-50 dark:bg-rose-900/20"
                    borderColorClass="border-rose-500/20"
                    loading={loading}
                />

                <StatCard
                    label="Fulfillment Status"
                    value={(stats as any)?.fulfillment?.pending || 0}
                    subValue={`${(stats as any)?.fulfillment?.picking || 0} tasks in progress`}
                    icon={Truck}
                    colorClass="text-brand-600 font-mono"
                    bgClass="bg-brand-50 dark:bg-brand-900/20"
                    borderColorClass="border-brand-500/20"
                    loading={loading}
                />
            </div>

            {/* Platform Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardData?.platformStats.map((s: any) => (
                    <div key={s.label} className={`bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-lg hover:${s.border} group`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className={`p-2.5 ${s.bg} dark:bg-slate-900/50 rounded-xl group-hover:rotate-12 transition-transform`}>
                                <s.icon className={`w-4 h-4 ${s.color}`} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono">{s.value}</h3>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sales Chart */}
                <SalesChart data={stats?.salesData || []} loading={loading} />

                <div className="flex flex-col gap-6">
                    {/* Activity Distribution */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter italic">Platform Health</h3>
                        <div className="space-y-6">
                            {dashboardData?.healthItems.map((item: any) => (
                                <div key={item.label}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                        <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{item.val}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((item.val / (Math.max(item.val, 1) * 1.5)) * 100, 100)}%` }}
                                            className={`h-full ${item.color}`}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-brand-600 p-8 rounded-[40px] shadow-xl shadow-brand-200 flex flex-col justify-center">
                        <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tighter italic">Command Center</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/admin/products/new" className="p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all text-center group">
                                <Plus className="w-6 h-6 text-white mb-2 group-hover:scale-110 transition-transform mx-auto" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/80">New Item</p>
                            </Link>
                            <Link href="/admin/purchases/new" className="p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all text-center group">
                                <Truck className="w-6 h-6 text-white mb-2 group-hover:scale-110 transition-transform mx-auto" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/80">Purchase</p>
                            </Link>
                            <Link href="/admin/fulfillment" className="p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all text-center group col-span-2">
                                <CheckCircle2 className="w-6 h-6 text-white mb-2 group-hover:scale-110 transition-transform mx-auto" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/80">Fulfillment Hub</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Items Grid */}
                <div className="grid grid-cols-1 gap-8">
                    {/* Recent Purchases */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter italic">
                                <HistoryIcon className="w-6 h-6 text-brand-500" /> Recent Activity
                            </h3>
                            <Link href="/admin/purchases" className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">View Ledger</Link>
                        </div>
                        <div className="space-y-4">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-20 bg-slate-50 dark:bg-slate-900/30 animate-pulse rounded-2xl"></div>
                                ))
                            ) : stats?.supplierStats?.recentPurchaseOrders?.length ? (
                                stats.supplierStats.recentPurchaseOrders.map((po: any) => (
                                    <Link key={po.id} href={`/admin/purchases/${po.id}`} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:rotate-12 transition-transform">
                                                <Package className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white text-sm">{po.referenceNumber}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{po.supplier?.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-900 dark:text-white font-mono text-sm">{formatPrice(po.totalAmount)}</p>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-500">{po.status}</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/20 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
                                    <Truck className="w-12 h-12 text-slate-200 mx-auto" strokeWidth={1} />
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-4">Empty active pool</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter italic">
                        <Package className="w-6 h-6 text-rose-500" /> Stock Deficiency
                    </h3>
                    <Link href="/admin/products?status=active" className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline">Replenish Inventory</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-24 bg-slate-50 dark:bg-slate-900/30 animate-pulse rounded-3xl"></div>
                        ))
                    ) : stats?.lowStockProducts?.length ? (
                        stats.lowStockProducts.map((item: any) => (
                            <Link key={item.id} href={`/admin/products/${item.id}`} className="flex items-center justify-between p-5 rounded-[32px] bg-rose-50/30 dark:bg-rose-900/10 border border-rose-100/50 dark:border-rose-900/20 hover:border-rose-500/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform shadow-sm">
                                        {item.image ? (
                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-6 h-6 text-slate-200" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white text-sm line-clamp-1">{item.name}</p>
                                        <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-0.5">Alert Level: {item.threshold}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">In Stock</p>
                                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-600 font-mono">
                                        {item.stock}
                                    </span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-900/20 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800">
                            <Package className="w-12 h-12 text-slate-100 mx-auto" strokeWidth={1} />
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-4 italic">No critical deplete detected</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
