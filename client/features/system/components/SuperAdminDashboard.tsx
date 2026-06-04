'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  DollarSign,
  CreditCard,
  AlertCircle,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { fetchSuperAdminAPI, downloadSuperAdminFile } from '@/services/supperAdminApi';
import toast from 'react-hot-toast';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type RankedTenantAnalytics = TenantAnalytics & { rank: number };

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

interface BillingOverview {
  totalRevenue: number;
  mrr: number;
  arr: number;
  failedCount: number;
  pendingCount: number;
  totalInvoices: number;
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

interface ActionItem {
  id: string;
  label: string;
  detail: string;
  count: number;
  href: string;
  tone: 'rose' | 'amber' | 'indigo' | 'emerald';
  icon: React.ReactNode;
}

const ACTION_TONES: Record<ActionItem['tone'], string> = {
  rose: 'border-rose-100 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400',
  amber: 'border-amber-100 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
  indigo: 'border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400',
  emerald: 'border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
};

const currency = (value: number) =>
  `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export default function SuperAdminDashboard({ stats: initialStats, traffic: initialTraffic, tenantAnalytics: initialAnalytics }: SuperAdminDashboardProps) {
  const [days, setDays] = useState(7);
  const [stats, setStats] = useState(initialStats);
  const [traffic, setTraffic] = useState(initialTraffic);
  const [analytics, setAnalytics] = useState<TenantAnalytics[]>(initialAnalytics);
  const [billing, setBilling] = useState<BillingOverview | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const requestIdRef = useRef(0);

  const refresh = useCallback(async (selectedDays: number, silent = false) => {
    if (!silent) setIsRefreshing(true);
    const requestId = ++requestIdRef.current;
    try {
      const [overview, analyticsRes, billingRes] = await Promise.all([
        fetchSuperAdminAPI(`/super-admin/overview?days=${selectedDays}`),
        fetchSuperAdminAPI('/super-admin/tenants/analytics'),
        fetchSuperAdminAPI('/super-admin/billing/overview').catch(() => null),
      ]);

      // Latest-wins guard: ignore stale responses from earlier/auto refreshes.
      if (requestId !== requestIdRef.current) return;

      const tenants = analyticsRes.data || [];
      const plans = tenants.reduce((acc: Record<string, number>, t: TenantAnalytics) => {
        const plan = t.subscriptionPlan?.name?.toLowerCase() || 'basic';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
      }, {});
      const statuses = tenants.reduce((acc: Record<string, number>, t: TenantAnalytics) => {
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
      setAnalytics(tenants);
      if (billingRes?.success) setBilling(billingRes.data);
      setLastRefreshed(new Date());
    } catch {
      if (!silent) toast.error('Failed to refresh dashboard');
    } finally {
      if (!silent && requestId === requestIdRef.current) setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => refresh(days, true), 60_000);
    return () => clearInterval(interval);
  }, [days, refresh]);

  // Refresh on days change. Deferred so the state update doesn't run
  // synchronously inside the effect body (avoids cascading renders).
  useEffect(() => {
    const id = setTimeout(() => refresh(days), 0);
    return () => clearTimeout(id);
  }, [days, refresh]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadSuperAdminFile('/super-admin/analytics/export', `analytics-${Date.now()}.csv`);
      toast.success('Analytics CSV downloaded');
    } catch {
      toast.error('Failed to export analytics');
    } finally {
      setIsExporting(false);
    }
  };

  const cards = [
    { label: 'Total Stores', value: stats.totalTenants, icon: Store, gradient: 'from-indigo-500 to-purple-600', trend: stats.trends?.tenants || null, link: '/system/tenants' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, gradient: 'from-emerald-500 to-teal-600', trend: stats.trends?.users || null, link: '/system/users' },
    { label: 'Total Orders', value: stats.totalOrders, icon: BarChart3, gradient: 'from-amber-500 to-orange-600', trend: stats.trends?.orders || null, link: '/system/billing' },
    { label: '24h Requests', value: stats.requestsLast24h, icon: Activity, gradient: 'from-blue-500 to-cyan-600', trend: stats.trends?.traffic || null, link: '/system/health' },
    { label: 'Reviews', value: stats.totalReviews || 0, icon: Star, gradient: 'from-pink-500 to-rose-600', trend: stats.trends?.reviews || null, link: '/system/tenants' },
  ];

  const financeCards = [
    { label: 'All-Time Revenue', value: currency(billing?.totalRevenue || 0), sub: 'Gross settled payments', icon: DollarSign, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Monthly Recurring', value: currency(billing?.mrr || 0), sub: 'Current month MRR', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Annual Recurring', value: currency(billing?.arr || 0), sub: 'MRR extrapolated × 12', icon: Wallet, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Failed Payments', value: (billing?.failedCount || 0).toLocaleString(), sub: 'Requires attention', icon: AlertCircle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' },
  ];

  const planColorMap: Record<string, string> = {
    enterprise: 'bg-purple-500',
    'pro seller': 'bg-blue-500',
    starter: 'bg-slate-400',
    basic: 'bg-slate-400',
  };

  const actionItems = useMemo<ActionItem[]>(() => {
    const items: ActionItem[] = [];
    const suspended = stats.statuses?.suspended || 0;
    const expired = stats.statuses?.expired || 0;
    const trial = stats.statuses?.trial || 0;

    if (billing?.failedCount) {
      items.push({
        id: 'failed',
        label: 'Failed payments',
        detail: 'Invoices needing reconciliation',
        count: billing.failedCount,
        href: '/system/billing',
        tone: 'rose',
        icon: <CreditCard className="w-4 h-4" />,
      });
    }
    if (suspended) {
      items.push({
        id: 'suspended',
        label: 'Suspended stores',
        detail: 'Merchants currently blocked',
        count: suspended,
        href: '/system/tenants?status=suspended',
        tone: 'rose',
        icon: <XCircle className="w-4 h-4" />,
      });
    }
    if (expired) {
      items.push({
        id: 'expired',
        label: 'Expired subscriptions',
        detail: 'Lapsed plans to win back',
        count: expired,
        href: '/system/tenants?status=expired',
        tone: 'amber',
        icon: <AlertTriangle className="w-4 h-4" />,
      });
    }
    if (trial) {
      items.push({
        id: 'trial',
        label: 'Trials in progress',
        detail: 'Convert before they expire',
        count: trial,
        href: '/system/tenants?status=trial',
        tone: 'indigo',
        icon: <Clock className="w-4 h-4" />,
      });
    }
    if (billing?.pendingCount) {
      items.push({
        id: 'pending',
        label: 'Pending invoices',
        detail: 'Awaiting settlement',
        count: billing.pendingCount,
        href: '/system/billing',
        tone: 'amber',
        icon: <Clock className="w-4 h-4" />,
      });
    }
    return items;
  }, [stats.statuses, billing]);

  const topActiveStores = useMemo(() => {
    return [...analytics]
      .sort((a, b) => (b.stats?.orders || 0) - (a.stats?.orders || 0))
      .slice(0, 5)
      .map((t, idx) => ({ ...t, rank: idx + 1 }));
  }, [analytics]);

  const trafficChartData = useMemo(() => {
    return [...traffic]
      .slice(0, days)
      .reverse()
      .map((t) => {
        const dateObj = new Date(t.date);
        const valid = !isNaN(dateObj.getTime());
        return {
          label: valid ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—',
          requests: t.requestCount,
        };
      });
  }, [traffic, days]);

  const columns: DataTableColumn<RankedTenantAnalytics>[] = [
    {
      key: 'store',
      header: 'Store',
      className: 'px-6 py-4',
      cell: (t) => (
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-350 dark:text-slate-600 w-4">#{t.rank}</span>
          <div>
            <Link href={`/system/tenants/${t.id}/analytics`} className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {t.storeName}
            </Link>
            <p className="text-xs text-slate-400">{t.subdomain}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      className: 'px-6 py-4',
      cell: (t) => (
        <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${planColorMap[t.subscriptionPlan?.name?.toLowerCase() || 'basic'] || 'bg-slate-400'} text-white`}>
          {t.subscriptionPlan?.name || 'Basic'}
        </span>
      ),
    },
    {
      key: 'users',
      header: 'Users',
      headerClassName: 'text-center',
      className: 'px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300',
      cell: (t) => t.stats?.users || 0,
    },
    {
      key: 'products',
      header: 'Products',
      headerClassName: 'text-center',
      className: 'px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300',
      cell: (t) => t.stats?.products || 0,
    },
    {
      key: 'orders',
      header: 'Orders',
      headerClassName: 'text-center',
      className: 'px-6 py-4 text-center font-bold text-indigo-600 dark:text-indigo-400',
      cell: (t) => t.stats?.orders || 0,
    },
  ];

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
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <Link href="/system/tenants" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-semibold hover:bg-indigo-700 transition-all text-sm">
            Manage Stores
          </Link>
        </div>
      </div>

      {/* Platform Action Center */}
      {actionItems.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Action Center</h2>
              <p className="text-xs text-slate-500">Platform items that need your attention</p>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              {actionItems.length} {actionItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {actionItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`group flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all hover:shadow-md ${ACTION_TONES[item.tone]}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{item.label}</p>
                    <p className="text-[11px] opacity-70 truncate">{item.detail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xl font-black">{item.count}</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, i) => {
          const CardInner = (
            <>
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-xl bg-linear-to-br ${card.gradient} text-white shadow-lg`}>
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
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  View all <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </>
          );
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              {card.link ? (
                <Link
                  href={card.link}
                  className="block bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group h-full"
                >
                  {CardInner}
                </Link>
              ) : (
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all group h-full">
                  {CardInner}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Finance Snapshot */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Subscription Revenue</h2>
            <p className="text-xs text-slate-500">Platform-wide SaaS billing snapshot</p>
          </div>
          <Link href="/system/billing" className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
            Billing dashboard <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {financeCards.map((card) => (
            <div key={card.label} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/40">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white truncate mt-0.5">
                  {isRefreshing && !billing ? (
                    <span className="inline-block w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  ) : card.value}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-tight opacity-75">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>
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
                  <Link
                    key={status}
                    href={`/system/tenants?status=${status}`}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    {STATUS_ICONS[status] || <CheckCircle2 className="w-4 h-4 text-slate-400" />}
                    <div>
                      <p className="text-xs text-slate-500 capitalize">{status}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{count}</p>
                    </div>
                  </Link>
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
          <div className="flex-1 p-6 min-h-[280px]">
            {trafficChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                <AreaChart data={trafficChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700/40" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#94a3b8" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip content={<TrafficTooltip />} />
                  <Area type="monotone" dataKey="requests" name="Requests" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTraffic)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
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
      {analytics.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top Active Stores</h2>
              <p className="text-xs text-slate-500">Ranked by order volume</p>
            </div>
            <Link href="/system/tenants" className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors">View all →</Link>
          </div>
          <DataTable
            data={topActiveStores}
            columns={columns}
            getRowKey={t => t.id}
            containerClassName="border-0 shadow-none rounded-t-none rounded-b-3xl bg-transparent"
          />
        </div>
      )}
    </div>
  );
}

const TrafficTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-2xl shadow-2xl">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 border-b border-slate-800 pb-1.5">{label}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requests</span>
          <p className="text-sm font-black text-indigo-400">{payload[0].value.toLocaleString()}</p>
        </div>
      </div>
    );
  }
  return null;
};
