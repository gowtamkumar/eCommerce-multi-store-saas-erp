'use client';
import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import { FileText, Package, ShoppingBag, TrendingUp, History as HistoryIcon, Plus, Truck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardStats } from '../types';


export default function AdminDashboard() {
    const { formatPrice, selectedCurrency } = useSettings();
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
    const [stats, setStats] = useState<DashboardStats>({
        totalSales: 0,
        periodSales: 0,
        periodOrders: 0,
        activeOrders: 0,
        totalProducts: 0,
        totalPages: 0,
        recentPages: [],
        salesData: [],
        monthlyGrowth: null,
    });
    const [recentProducts, setRecentProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, [period]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await fetchAPI(`/report/dashboard?period=${period}`);

            if (response.success && response.data) {
                const {
                    totalSales,
                    periodSales,
                    periodOrders,
                    activeOrders,
                    totalProducts,
                    totalPages,
                    recentPages,
                    recentProducts,
                    salesData,
                    monthlyGrowth,
                    supplierStats,
                    lowStockCount,
                    lowStockProducts
                } = response.data;

                setStats({
                    totalSales,
                    periodSales,
                    periodOrders,
                    activeOrders,
                    totalProducts,
                    totalPages,
                    recentPages,
                    salesData,
                    monthlyGrowth,
                    supplierStats,
                    lowStockCount,
                    lowStockProducts
                });
                setRecentProducts(recentProducts);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Dashboard Overview</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        {(['day', 'week', 'month'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${period === p
                                    ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                                {period.charAt(0).toUpperCase() + period.slice(1)} Sales
                            </p>
                            {loading ? (
                                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                            ) : (
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatPrice(stats.periodSales)}</h3>
                            )}
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <span className="text-green-600 dark:text-green-400 font-bold">{selectedCurrency.symbol}</span>
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {stats.periodOrders} orders this {period}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Active Orders</p>
                            {loading ? (
                                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                            ) : (
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeOrders}</h3>
                            )}
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Current active sessions
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Growth Index</p>
                            {loading ? (
                                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                            ) : (
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.monthlyGrowth !== null ? `${stats.monthlyGrowth.toFixed(0)}%` : '---'}
                                </h3>
                            )}
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Monthly performance trend
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Lifetime Revenue</p>
                            {loading ? (
                                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                            ) : (
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatPrice(stats.totalSales)}</h3>
                            )}
                        </div>
                        <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-xl">
                            <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Total sales since launch
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sales Chart */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-brand-500" /> Revenue Analytics
                        </h3>
                    </div>
                    <div className="h-[350px] w-full">
                        {loading ? (
                            <div className="w-full h-full bg-slate-50 dark:bg-slate-900/50 animate-pulse rounded-2xl"></div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.salesData}>
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
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                        tickFormatter={(value) => `${formatPrice(value)}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            borderRadius: '16px',
                                            border: 'none',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            color: '#fff',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ color: '#fff', fontWeight: 800 }}
                                        labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}
                                        formatter={(value: any) => [`${formatPrice(value)}`, 'Sales']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#3b82f6"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorSales)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Supply Chain Stats */}
                    <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Truck className="w-24 h-24" />
                        </div>
                        <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                            Supply Chain
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Due to Suppliers</p>
                                <p className="text-3xl font-black text-rose-400 font-mono">
                                    {formatPrice(stats.supplierStats?.totalAmountDue || 0)}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Suppliers</p>
                                    <p className="text-xl font-black">{stats.supplierStats?.totalSuppliers || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Purchases</p>
                                    <p className="text-xl font-black">{stats.supplierStats?.totalPurchaseOrders || 0}</p>
                                </div>
                            </div>

                            {(stats.lowStockCount || 0) > 0 ? (
                                <Link
                                    href="/admin/inventory"
                                    className="mt-4 block w-full py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-2xl text-center text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    ⚠️ {stats.lowStockCount} Low Stock Items
                                </Link>
                            ) : (
                                <Link
                                    href="/admin/purchases"
                                    className="mt-4 block w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-center text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Manage Supplies
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Quick Launch */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/admin/products/new" className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:bg-brand-50 dark:hover:bg-brand-900/20 group transition-all">
                                <Plus className="w-6 h-6 text-brand-600 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] font-black uppercase tracking-widest">New Product</p>
                            </Link>
                            <Link href="/admin/purchases/new" className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group transition-all">
                                <Truck className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] font-black uppercase tracking-widest">New Purchase</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Purchases */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <HistoryIcon className="w-6 h-6 text-brand-500" /> Recent Purchases
                        </h3>
                        <Link href="/admin/purchases" className="text-sm font-bold text-brand-600 hover:underline">View all</Link>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-20 bg-slate-50 dark:bg-slate-900/50 animate-pulse rounded-2xl"></div>
                            ))
                        ) : stats.supplierStats?.recentPurchaseOrders?.length ? (
                            stats.supplierStats.recentPurchaseOrders.map((po: any) => (
                                <Link
                                    key={po.id}
                                    href={`/admin/purchases/${po.id}`}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                            <Package className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 dark:text-white">{po.referenceNumber}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{po.supplier?.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 dark:text-white font-mono">{formatPrice(po.totalAmount)}</p>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${po.status === 'RECEIVED' ? 'text-emerald-500' : 'text-orange-500'
                                            }`}>
                                            {po.status}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <Truck className="w-12 h-12 text-slate-200 mx-auto" strokeWidth={1} />
                                <p className="text-sm text-slate-400 font-bold italic">No purchase orders found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Products */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <Plus className="w-6 h-6 text-brand-500" /> Recent Products
                        </h3>
                        <Link href="/admin/products" className="text-sm font-bold text-brand-600 hover:underline">View all</Link>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-20 bg-slate-50 dark:bg-slate-900/50 animate-pulse rounded-2xl"></div>
                            ))
                        ) : recentProducts.map((product: any) => (
                            <div key={product.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 group transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                        {product.images?.[0] && (
                                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white text-sm line-clamp-1">{product.name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 font-mono tracking-tighter">{formatPrice(product.price)}</p>
                                    </div>
                                </div>
                                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${product.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {product.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Pages */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <FileText className="w-6 h-6 text-brand-500" /> Recent Pages
                        </h3>
                        <Link href="/admin/pages" className="text-sm font-bold text-brand-600 hover:underline">View all</Link>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-20 bg-slate-50 dark:bg-slate-900/50 animate-pulse rounded-2xl"></div>
                            ))
                        ) : stats.recentPages.map((page: any) => (
                            <div key={page.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 group transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:rotate-12 transition-transform">
                                        <FileText className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white text-sm line-clamp-1">{page.title}</p>
                                        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">/{page.isHomePage ? 'index' : page.slug}</p>
                                    </div>
                                </div>
                                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${page.status === 'published' ? 'bg-cyan-100 text-cyan-600' : 'bg-yellow-100 text-yellow-600'
                                    }`}>
                                    {page.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}


