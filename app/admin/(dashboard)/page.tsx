'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { fetchAPI } from '@/lib/api';
import { OrderStatus } from '@/lib/enums/order-status';
import { FileText, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DashboardStats {
  totalSales: number;
  activeOrders: number;
  totalProducts: number;
  totalPages: number;
  recentPages: any[];
  salesData: any[];
  monthlyGrowth: number | null;
}

export default function AdminDashboard() {
  const { formatPrice, selectedCurrency } = useSettings();
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
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
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch all data in parallel
      const [ordersData, productsData, paymentsData, pagesData] = await Promise.all([
        fetchAPI('/orders'),
        fetchAPI('/products'),
        fetchAPI('/payments'),
        fetchAPI('/pages'),
      ]);


      // Calculate stats
      const activeOrders = ordersData.data.orders
        ?.filter((o: any) => o.status === OrderStatus.PENDING).length || 0;

      const totalProducts = productsData.data.products?.length || 0;
      const totalSales = paymentsData.data?.reduce((sum: number, p: any) => sum + (+p.amount || 0), 0) || 0;
      const totalPages = pagesData.data?.length || 0;
      const recentPages = pagesData.data?.slice(0, 5) || [];
      const recentProducts = productsData.data.products?.slice(0, 5) || [];

      setRecentProducts(recentProducts);

      // Calculate monthly growth
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthSales = paymentsData.data?.filter((p: any) => {
        const date = new Date(p.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

      const previousMonthSales = paymentsData.data?.filter((p: any) => {
        const date = new Date(p.createdAt);
        return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
      }).reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

      let monthlyGrowth: number | null = null;
      if (previousMonthSales > 0) {
        monthlyGrowth = ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100;
      } else if (currentMonthSales > 0) {
        monthlyGrowth = 100; // 100% growth if previous month had no sales
      }

      // Process sales data for chart (Last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const salesData = last7Days.map(date => {
        const daySales = paymentsData.data?.filter((p: any) => p.createdAt.startsWith(date))
          .reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
        return {
          name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sales: daySales,
        };
      });

      setStats({
        totalSales,
        activeOrders,
        totalProducts,
        totalPages,
        recentPages,
        salesData,
        monthlyGrowth,
      });
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
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Sales</p>
              {loading ? (
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
              ) : (
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{formatPrice(stats.totalSales)}</h3>
              )}
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              {selectedCurrency.symbol}
              {/* <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" /> */}
            </div>
          </div>
          {stats.monthlyGrowth !== null ? (
            <div className={`flex items-center gap-2 text-sm ${stats.monthlyGrowth >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
              }`}>
              <TrendingUp className={`w-4 h-4 ${stats.monthlyGrowth < 0 ? 'rotate-180' : ''
                }`} />
              <span className="font-medium">
                {stats.monthlyGrowth >= 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}% from last month
              </span>
            </div>
          ) : (
            <div className="text-sm text-slate-400">
              <span>No previous month data</span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Active Orders</p>
              {loading ? (
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
              ) : (
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activeOrders}</h3>
              )}
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Orders pending processing
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Products</p>
              {loading ? (
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
              ) : (
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalProducts}</h3>
              )}
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            In your inventory
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Pages</p>
              {loading ? (
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
              ) : (
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalPages}</h3>
              )}
            </div>
            <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-xl">
              <FileText className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Created in Page Builder
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
  );
}


