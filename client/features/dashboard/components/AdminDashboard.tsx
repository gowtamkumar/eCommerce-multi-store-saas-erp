'use client';
import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import { FileText, Package, ShoppingBag, TrendingUp } from 'lucide-react';
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
                    monthlyGrowth
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
                <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Sales Overview</h3>
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-xl"></div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.salesData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        tickFormatter={(value) => `${formatPrice(value)}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        formatter={(value: any) => [`${formatPrice(value)}`, 'Sales']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorSales)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Recent Products */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Products</h3>
                            <Link href="/admin/products" className="text-sm text-brand-600 hover:underline">View all</Link>
                        </div>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700/50 animate-pulse rounded-xl"></div>
                                    ))}
                                </div>
                            ) : (
                                recentProducts.map((product: any) => (
                                    <div key={product.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                                {product.images?.[0] && (
                                                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                                                <p className="text-xs text-slate-500">{formatPrice(product.price)}</p>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${product.status === 'active'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                                            }`}>
                                            {product.status}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Pages */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Pages</h3>
                            <Link href="/admin/pages" className="text-sm text-brand-600 hover:underline">View all</Link>
                        </div>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700/50 animate-pulse rounded-xl"></div>
                                    ))}
                                </div>
                            ) : (
                                stats.recentPages.map((page: any) => (
                                    <div key={page.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white">{page.title}</p>
                                                <p className="text-xs text-slate-500">/{page.isHomePage ? '' : page.slug}</p>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${page.status === 'published'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                                            }`}>
                                            {page.status}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


