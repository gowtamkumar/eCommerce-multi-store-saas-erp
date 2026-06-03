'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  BarChart3, 
  Store, 
  Users,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { fetchSuperAdminAPI } from '@/services/supperAdminApi';
import toast from 'react-hot-toast';

interface TrafficData {
  date: string;
  requestCount: number;
}

interface TenantAnalytics {
  id: string;
  storeName: string;
  subdomain: string;
  planTier: string;
  status: string;
  subscriptionPlan?: { name: string };
  stats: { users: number; products: number; orders: number; pages: number; traffic: number; };
}

interface Stats {
  totalTenants: number;
  totalUsers: number;
  totalOrders: number;
  totalReviews?: number;
  requestsLast24h: number;
  plans: Record<string, number>;
  statuses: Record<string, number>;
  trends?: {
    tenants?: string | null;
    users?: string | null;
    orders?: string | null;
    traffic?: string | null;
    reviews?: string | null;
  };
}

interface SuperAdminDashboardProps {
  stats: Stats;
  traffic: TrafficData[];
  tenantAnalytics: TenantAnalytics[];
}

const DAYS_OPTIONS = [
  { label: '7 Days', value: 7 },
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
];

function TrendBadge({ trend }: { trend?: string | null }) {
  if (!trend) return (
    <span className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg">
      <Minus className="w-3 h-3" /> No data
    </span>
  );
  const isPositive = trend.startsWith('+');
  const isNegative = trend.startsWith('-');
  return (
    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : isNegative ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' : 'bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      {trend}
    </span>
  );
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  active: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  trial: <Clock className="w-4 h-4 text-amber-500" />,
  suspended: <XCircle className="w-4 h-4 text-rose-500" />,
  expired: <AlertTriangle className="w-4 h-4 text-orange-500" />,
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500',
  trial: 'bg-amber-500',
  suspended: 'bg-rose-500',
  expired: 'bg-orange-500',
};

export default function SuperAdminDashboard({ stats: initialStats, traffic: initialTraffic, tenantAnalytics: initialAnalytics }: SuperAdminDashboardProps) {
  const [days, setDays] = useState(7);
  const [stats, setStats] = useState(initialStats);
  const [traffic, setTraffic] = useState(initialTraffic);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const refresh = useCallback(async (selectedDays: number, silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [overview, analyticsRes] = await Promise.all([
        fetchSuperAdminAPI(`/super-admin/overview?days=${selectedDays}`),
        fetchSuperAdminAPI('/super-admin/tenants/analytics'),
      ]);

      const tenants = analyticsRes.data || [];
      const plans = tenants.reduce((acc: Record<string, number>, t: any) => {
        const plan = t.subscriptionPlan?.name?.toLowerCase() || 'basic';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      }, {});
      const statuses = tenants.reduce((acc: Record<string, number>, t: any) => {
        const status = t.status?.toLowerCase() || 'active';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalTenants: overview.data?.totalTenants || 0,
        totalUsers: overview.data?.totalUsers || 0,
        totalOrders: overview.data?.totalOrders || 0,
        totalReviews: overview.data?.totalReviews || 0,
        requestsLast24h: overview.data?.totalRequestsLast24h || 0,
        plans,
        statuses,
        trends: overview.data?.trends,
      });
      setTraffic(overview.data?.traffic || []);
      setLastRefreshed(new Date());
    } catch (e) {
      if (!silent) toast.error('Failed to refresh dashboard');
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => refresh(days, true), 60_000);
    return () => clearInterval(interval);
  }, [days, refresh]);

  // Refresh on days change
  useEffect(() => {
    refresh(days);
  }, [days, refresh]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/proxy/super-admin/analytics/export', {
        headers: { 'Content-Type': 'application/json' },
      });
      // Fallback: use fetchSuperAdminAPI to construct the download
      toast.error('Please use the direct API link: /api/super-admin/analytics/export');
    } catch {
      // Direct download via anchor
    } finally {
      setIsExporting(false);
    }
    // Direct download
    const link = document.createElement('a');
    link.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/super-admin/analytics/export`;
    link.click();
  };

  const cards = [
    { label: 'Total Stores', value: stats.totalTenants, icon: Store, color: 'bg-indigo-500', gradient: 'from-indigo-500 to-purple-600', trend: stats.trends?.tenants || null, link: '/system/tenants' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-emerald-500', gradient: 'from-emerald-500 to-teal-600', trend: stats.trends?.users || null, link: '/system/users' },
    { label: 'Total Orders', value: stats.totalOrders, icon: BarChart3, color: 'bg-amber-500', gradient: 'from-amber-500 to-orange-600', trend: stats.trends?.orders || null, link: null },
    { label: '24h Requests', value: stats.requestsLast24h, icon: Activity, color: 'bg-blue-500', gradient: 'from-blue-500 to-cyan-600', trend: stats.trends?.traffic || null, link: null },
    { label: 'Reviews', value: stats.totalReviews || 0, icon: Star, color: 'bg-pink-500', gradient: 'from-pink-500 to-rose-600', trend: stats.trends?.reviews || null, link: null },
  ];

  const planColorMap: Record<string, string> = {
    enterprise: 'bg-purple-500',
    'pro seller': 'bg-blue-500',
    starter: 'bg-slate-400',
    basic: 'bg-slate-400',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Control Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Monitoring <span className="font-bold text-indigo-600 dark:text-indigo-400">{stats.totalTenants}</span> merchants.{' '}
            <span className="text-xs text-slate-400">Last refreshed: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Date Range Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
            {DAYS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${days === opt.value ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => refresh(days)}
            disabled={isRefreshing}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <Link href="/system/tenants" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-semibold hover:bg-indigo-700 transition-all text-sm">
            Manage Stores
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}>
                <card.icon className="w-5 h-5" />
              </div>
              <TrendBadge trend={card.trend} />
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">{card.label}</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {isRefreshing ? (
                <span className="inline-block w-16 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ) : card.value.toLocaleString()}
            </p>
            {card.link && (
              <Link href={card.link} className="mt-2 text-xs font-semibold text-indigo-500 hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity">
                View all →
              </Link>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Plan Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Plan Distribution</h2>
          <p className="text-xs text-slate-400 mb-6">{stats.totalTenants} tenants total</p>
          <div className="space-y-5">
            {Object.entries(stats.plans).length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-4">No tenant data yet</p>
            ) : Object.entries(stats.plans).map(([plan, count]) => (
              <div key={plan}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">{plan}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{count} <span className="text-slate-400 font-normal text-xs">stores</span></span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.totalTenants > 0 ? (count / stats.totalTenants) * 100 : 0}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${planColorMap[plan.toLowerCase()] || 'bg-indigo-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Status breakdown */}
          {Object.keys(stats.statuses).length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Store Status</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(stats.statuses).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    {STATUS_ICONS[status] || <CheckCircle2 className="w-4 h-4 text-slate-400" />}
                    <div>
                      <p className="text-xs text-slate-500 capitalize">{status}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Traffic Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col">
          <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Platform Traffic</h2>
              <p className="text-xs text-slate-500">Cross-tenant request volume — last {days} days</p>
            </div>
            {stats.trends?.traffic && (
              <TrendBadge trend={stats.trends.traffic} />
            )}
          </div>
          <div className="flex-1 p-8">
            {traffic.length > 0 ? (() => {
              const maxVal = Math.max(...traffic.map(x => x.requestCount), 1);
              const chartData = [...traffic].slice(0, days).reverse();

              return (
                <div className="h-48 flex items-end gap-1.5 px-2">
                  {chartData.map((t, i) => {
                    const height = Math.max((t.requestCount / maxVal) * 100, 2);
                    const dateObj = new Date(t.date);
                    const isInvalidDate = isNaN(dateObj.getTime());

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                          {t.requestCount.toLocaleString()} req
                          <br />
                          <span className="text-slate-400">{!isInvalidDate ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'}</span>
                        </div>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.02 }}
                          className="w-full bg-indigo-500/20 group-hover:bg-indigo-500/60 rounded-t-md transition-colors min-h-[4px] cursor-pointer"
                        />
                        <span className="text-[7px] font-bold text-slate-400 uppercase hidden sm:block">
                          {!isInvalidDate ? dateObj.toLocaleDateString([], { weekday: 'short' }) : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })() : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                <Activity className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium">No traffic data yet</p>
                <p className="text-xs mt-1 opacity-60">Data will appear as requests come in</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Tenants by Activity */}
      {initialAnalytics.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top Active Stores</h2>
              <p className="text-xs text-slate-500">Ranked by order volume</p>
            </div>
            <Link href="/system/tenants" className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Store</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Users</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Products</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {initialAnalytics
                  .sort((a, b) => (b.stats?.orders || 0) - (a.stats?.orders || 0))
                  .slice(0, 5)
                  .map((t, i) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-300 dark:text-slate-600 w-4">#{i + 1}</span>
                          <div>
                            <Link href={`/system/tenants/${t.id}/analytics`} className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                              {t.storeName}
                            </Link>
                            <p className="text-xs text-slate-400">{t.subdomain}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${planColorMap[t.subscriptionPlan?.name?.toLowerCase() || 'basic'] || 'bg-slate-400'} text-white`}>
                          {t.subscriptionPlan?.name || 'Basic'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">{t.stats?.users || 0}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">{t.stats?.products || 0}</td>
                      <td className="px-6 py-4 text-center font-bold text-indigo-600 dark:text-indigo-400">{t.stats?.orders || 0}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
