'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { OrderStatus } from '@/lib/enums/order-status';
import { Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DashboardStats {
  totalSales: number;
  activeOrders: number;
  totalProducts: number;
  salesData: any[];
  monthlyGrowth: number | null;
}

export default function AdminDashboard() {
  const { settings, formatPrice, selectedCurrency } = useSettings();
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    activeOrders: 0,
    totalProducts: 0,
    salesData: [],
    monthlyGrowth: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch all data in parallel
      const [ordersRes, productsRes, paymentsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products'),
        fetch('/api/payments'),
      ]);

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();
      const paymentsData = await paymentsRes.json();

      // Calculate stats
      const activeOrders = ordersData.orders?.filter((o: any) => o.status === OrderStatus.PENDING).length || 0;
      const totalProducts = productsData.products?.length || 0;
      const totalSales = paymentsData.payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

      // Calculate monthly growth
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthSales = paymentsData.payments?.filter((p: any) => {
        const date = new Date(p.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

      const previousMonthSales = paymentsData.payments?.filter((p: any) => {
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
        const daySales = paymentsData.payments?.filter((p: any) => p.createdAt.startsWith(date))
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
}


