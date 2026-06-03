'use client';
import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, CheckCircle2, Coins, History as HistoryIcon, Package, Plus, RefreshCw, ShoppingBag, Store, TrendingUp, Truck, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardStats } from '../types';

// Small period-over-period trend badge
const TrendBadge = React.memo(({ value }: { value: number | null | undefined }) => {
    if (value === null || value === undefined) return null;
    const positive = value >= 0;
    const Icon = positive ? ArrowUpRight : ArrowDownRight;
    return (
        <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-black ${positive
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                }`}
        >
            <Icon className="w-3 h-3" />
            {Math.abs(value).toFixed(1)}%
        </span>
    );
});
TrendBadge.displayName = 'TrendBadge';

// Memoized Stat Card Component
const StatCard = React.memo(({
    label,
    value,
    subValue,
    icon: Icon,
    colorClass,
    bgClass,
    loading,
    isPrice = false,
    formatPrice,
    trend,
}: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 group">
        <div className="flex items-center justify-between mb-4">
            <div>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                    {label}
                </p>
                {loading ? (
                    <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                ) : (
                    <div className="flex items-center gap-2">
                        <h3 className={`text-2xl font-black ${colorClass || 'text-slate-900 dark:text-white'} font-mono`}>
                            {isPrice ? formatPrice(value) : value}
                        </h3>
                        {!loading && <TrendBadge value={trend} />}
                    </div>
                )}
            </div>
            <div className={`p-3 ${bgClass} rounded-2xl group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${colorClass}`} />
            </div>
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
            {subValue}
        </div>
    </div>
));

StatCard.displayName = 'StatCard';

// Memoized Chart Widget
const SalesChart = React.memo(({ data, loading, period }: any) => (
    <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter italic">
                    <TrendingUp className="w-6 h-6 text-brand-500" /> Sales Velocity
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {period === 'day' ? 'Hourly flow · today' : period === 'week' ? 'Daily flow · last 7 days' : 'Daily flow · last 30 days'}
                </p>
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

const ORDER_STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-600',
    confirmed: 'bg-blue-100 text-blue-600',
    shipped: 'bg-indigo-100 text-indigo-600',
    completed: 'bg-emerald-100 text-emerald-600',
    cancelled: 'bg-rose-100 text-rose-600',
};

export default function AdminDashboard() {
    const { formatPrice } = useSettings();
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchDashboardStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchAPI(`/report/dashboard?period=${period}`);
            if (response.success && response.data) {
                setStats(response.data);
                setLastUpdated(new Date());
            } else {
                setError('Unable to load dashboard data.');
            }
        } catch (err) {
            console.error('Failed to fetch dashboard stats', err);
            setError('Failed to load dashboard. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    const healthItems = useMemo(() => {
        if (!stats) return [];
        const items = [
            { label: 'Users', val: stats.counts?.users || 0, color: 'bg-indigo-500' },
            { label: 'Products', val: stats.counts?.products || 0, color: 'bg-emerald-500' },
            { label: 'Orders', val: stats.counts?.orders || 0, color: 'bg-amber-500' },
            { label: 'Pages', val: stats.counts?.pages || 0, color: 'bg-blue-500' },
        ];
        // Scale each bar relative to the largest value so the widths are meaningful.
        const max = Math.max(...items.map((i) => i.val), 1);
        return items.map((i) => ({ ...i, pct: Math.round((i.val / max) * 100) }));
    }, [stats]);

    const periodLabel = period.charAt(0).toUpperCase() + period.slice(1);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display flex items-center gap-3">
                        Dashboard <span className="text-brand-600 italic">Overview</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">
                        Real-time performance metrics
                        {lastUpdated && (
                            <span className="text-slate-400 normal-case tracking-normal font-medium ml-2">
                                · Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchDashboardStats}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-brand-600 hover:border-brand-500/30 transition-all disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
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

            {error && (
                <div className="flex items-center justify-between gap-4 p-5 rounded-3xl bg-rose-50 dark:bg-rose-900/15 border border-rose-100 dark:border-rose-900/30">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                        <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
                    </div>
                    <button
                        onClick={fetchDashboardStats}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-widest transition-all"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Operational Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label={`${periodLabel} Sales`}
                    value={stats?.periodSales || 0}
                    subValue={`${stats?.periodOrders || 0} orders this ${period}`}
                    icon={TrendingUp}
                    colorClass="text-brand-600"
                    bgClass="bg-brand-50 dark:bg-brand-900/20"
                    loading={loading}
                    isPrice={true}
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
                    value={(stats as any)?.fulfillment?.pending || 0}
                    subValue={`${(stats as any)?.fulfillment?.picking || 0} tasks in progress`}
                    icon={Truck}
                    colorClass="text-brand-600"
                    bgClass="bg-brand-50 dark:bg-brand-900/20"
                    loading={loading}
                />
            </div>

            {/* Finance KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Sales"
                    value={stats?.totalSales || 0}
                    subValue="Lifetime completed revenue"
                    icon={Coins}
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-50 dark:bg-emerald-900/20"
                    loading={loading}
                    isPrice={true}
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
                    isPrice={true}
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
                    isPrice={true}
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sales Chart */}
                <SalesChart data={stats?.salesData || []} loading={loading} period={period} />

                <div className="flex flex-col gap-6">
                    {/* Activity Distribution */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter italic">Platform Health</h3>
                        <div className="space-y-6">
                            {healthItems.map((item: any) => (
                                <div key={item.label}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                        <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{item.val}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.pct}%` }}
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
                            <Link href="/admin/procurement/purchases/new" className="p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all text-center group">
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
                {/* Recent Customer Orders */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter italic">
                            <ShoppingBag className="w-6 h-6 text-brand-500" /> Recent Orders
                        </h3>
                        <Link href="/admin/orders" className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-20 bg-slate-50 dark:bg-slate-900/30 animate-pulse rounded-2xl"></div>
                            ))
                        ) : stats?.recentOrders?.length ? (
                            stats.recentOrders.map((o: any) => (
                                <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:rotate-12 transition-transform">
                                            <ShoppingBag className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 dark:text-white text-sm">#{String(o.id).substring(0, 8)}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1">{o.customerName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 dark:text-white font-mono text-sm">{formatPrice(o.totalAmount)}</p>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${ORDER_STATUS_STYLES[String(o.status).toLowerCase()] || 'bg-slate-100 text-slate-500'}`}>
                                            {o.status}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/20 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
                                <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto" strokeWidth={1} />
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-4">No recent orders</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Purchases */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter italic">
                            <HistoryIcon className="w-6 h-6 text-brand-500" /> Recent Purchases
                        </h3>
                        <Link href="/admin/procurement/purchases" className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">View Ledger</Link>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-20 bg-slate-50 dark:bg-slate-900/30 animate-pulse rounded-2xl"></div>
                            ))
                        ) : stats?.supplierStats?.recentPurchaseOrders?.length ? (
                            stats.supplierStats.recentPurchaseOrders.map((po: any) => (
                                <Link key={po.id} href={`/admin/procurement/purchases/${po.id}`} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 transition-all group">
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
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
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
