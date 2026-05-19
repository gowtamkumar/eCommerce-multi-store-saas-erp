'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  ArrowUpRight, 
  BarChart3, 
  CreditCard, 
  ShieldCheck, 
  Store, 
  Users,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Search,
  Terminal,
  MapPin,
  Laptop,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalTenants: number;
  totalUsers: number;
  totalOrders: number;
  totalReviews?: number;
  requestsLast24h: number;
  plans: Record<string, number>;
  statuses: Record<string, number>;
}

interface TrafficData {
  id?: string;
  tenantId?: string;
  date: string;
  requestCount: number;
  lastUpdated?: string;
}

interface TenantAnalytics {
  id: string;
  storeName: string;
  subdomain: string;
  planTier: string;
  status: string;
  stats: {
    users: number;
    products: number;
    orders: number;
    pages: number;
    traffic: number;
  }
}

interface SuperAdminDashboardProps {
  stats: Stats;
  traffic: TrafficData[];
  tenantAnalytics: TenantAnalytics[];
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-100/60 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/50',
  UPDATE: 'bg-amber-100/60 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/50',
  DELETE: 'bg-rose-100/60 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/50',
  ROLE_CREATED: 'bg-purple-100/60 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200/50',
  ROLE_MODIFIED: 'bg-indigo-100/60 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200/50',
  ROLE_DELETED: 'bg-rose-100/60 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/50',
  USER_ROLE_ASSIGNED: 'bg-purple-100/60 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200/50',
  USER_ROLE_REVOKED: 'bg-amber-100/60 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/50',
  PERMISSION_CHECK_FAILED: 'bg-red-100/60 text-red-750 dark:bg-red-950/50 dark:text-red-400 border-red-200/50',
};

export default function SuperAdminDashboard({ stats, traffic, tenantAnalytics }: SuperAdminDashboardProps) {
  const cards = [
    { label: 'Total Stores', value: stats.totalTenants, icon: Store, color: 'bg-indigo-500', trend: '+12%' },
    { label: 'Users', value: stats.totalUsers, icon: Users, color: 'bg-emerald-500', trend: '+5%' },
    { label: 'Orders', value: stats.totalOrders, icon: BarChart3, color: 'bg-amber-500', trend: '+18%' },
    { label: '24h Traffic', value: stats.requestsLast24h, icon: Activity, color: 'bg-blue-500', trend: 'Requests' },
  ];

  const planLabels: Record<string, string> = {
    enterprise: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    pro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    basic: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  };

  // --- Real-time Audit Logs state ---
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [actorSearch, setActorSearch] = useState('');
  const [tenantFilter, setTenantFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');

  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const { fetchAPI } = await import('@/services/api');
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '10');
      if (actionFilter) params.append('action', actionFilter);
      if (entityFilter) params.append('entity', entityFilter);
      if (actorSearch) params.append('userId', actorSearch);
      if (tenantFilter) params.append('tenantId', tenantFilter);
      if (branchFilter) params.append('branchId', branchFilter);
      if (warehouseFilter) params.append('warehouseId', warehouseFilter);

      const res = await fetchAPI(`/audit-logs?${params.toString()}`);
      if (res?.data) {
        setLogs(res.data.data || []);
        setTotalPages(res.data.meta?.totalPages || 1);
        setTotalLogs(res.data.meta?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch platform audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, actionFilter, entityFilter, actorSearch, tenantFilter, branchFilter, warehouseFilter]);

  const handleResetFilters = () => {
    setActionFilter('');
    setEntityFilter('');
    setActorSearch('');
    setTenantFilter('');
    setBranchFilter('');
    setWarehouseFilter('');
    setCurrentPage(1);
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'SYS';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Control Center</h1>
          <p className="text-slate-500 dark:text-slate-400">Monitoring {stats.totalTenants} merchants across the infrastructure.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 transition-all text-sm">
            Export Analytics
          </button>
          <Link href="/system/tenants" className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-semibold hover:bg-indigo-700 transition-all text-sm">
            Manage Stores
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${card.color} text-white`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg">
                {card.trend}
              </span>
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{card.label}</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{card.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Plan Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Plan Distribution</h2>
          <div className="space-y-6">
            {Object.entries(stats.plans).map(([plan, count]) => (
              <div key={plan}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${planLabels[plan] || planLabels.basic}`}>
                    {plan}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                </div>
                <div className="w-full h-2 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / stats.totalTenants) * 100}%` }}
                    className={`h-full ${plan === 'enterprise' ? 'bg-purple-500' : plan === 'pro' ? 'bg-blue-500' : 'bg-slate-400'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Status */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col">
          <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Platform Activity</h2>
              <p className="text-sm text-slate-500">Cross-tenant request volume</p>
            </div>
          </div>
          <div className="flex-1 p-8">
            {traffic.length > 0 ? (() => {
              const maxVal = Math.max(...traffic.map(x => x.requestCount), 1);
              const chartData = [...traffic].slice(0, 14).reverse();

              return (
                <div className="h-48 flex items-end gap-2 px-4">
                  {chartData.map((t, i) => {
                    const height = (t.requestCount / maxVal) * 100;
                    const dateObj = new Date(t.date);
                    const isInvalidDate = isNaN(dateObj.getTime());

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {t.requestCount} requests
                        </div>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="w-full bg-indigo-500/20 group-hover:bg-indigo-500/40 rounded-t-lg transition-colors min-h-[4px]"
                        />
                        <span className="text-[8px] font-bold text-slate-400 uppercase hidden md:block">
                          {!isInvalidDate ? dateObj.toLocaleDateString([], { weekday: 'short' }) : '---'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              );
            })() : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 italic py-12">
                <Activity className="w-12 h-12 mb-4 opacity-20" />
                <p>No traffic data collected yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Per-Tenant Detailed Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Partition Health & Activity</h2>
          <p className="text-sm text-slate-500">Granular performance metrics per merchant tenant (Last 30 Days Traffic)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Merchant</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Users</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Traffic</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Orders</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Products</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Pages</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {tenantAnalytics.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-8 py-5">
                    <Link href={`/system/tenants/${tenant.id}/analytics`} className="group">
                      <p className="font-black text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">{tenant.storeName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{tenant.subdomain}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{tenant.stats.users}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-xs">
                      {tenant.stats.traffic.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{tenant.stats.orders}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{tenant.stats.products}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{tenant.stats.pages}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PLATFORM-WIDE IMMUTABLE AUDIT TRAIL --- */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-500" />
              Platform-Wide Security & Audit logs
            </h2>
            <p className="text-sm text-slate-550 dark:text-slate-400 mt-1">
              Immutable logs generated across all tenant partitions.
            </p>
          </div>
          <div>
            <button
              onClick={fetchAuditLogs}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-550 dark:text-slate-450 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all hover:scale-105 active:rotate-180 duration-500 shadow-sm"
              title="Refresh Platform Audit Logs"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Filters */}
        <div className="bg-slate-50/50 dark:bg-slate-900/40 p-5 rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-inner">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</label>
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-550 transition-all outline-none"
              >
                <option value="">All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="ROLE_CREATED">ROLE_CREATED</option>
                <option value="ROLE_MODIFIED">ROLE_MODIFIED</option>
                <option value="ROLE_DELETED">ROLE_DELETED</option>
                <option value="USER_ROLE_ASSIGNED">ROLE_ASSIGNED</option>
                <option value="USER_ROLE_REVOKED">ROLE_REVOKED</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entity Model</label>
              <select
                value={entityFilter}
                onChange={(e) => { setEntityFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-550 transition-all outline-none"
              >
                <option value="">All Models</option>
                <option value="Product">Product</option>
                <option value="Order">Order</option>
                <option value="Role">Role</option>
                <option value="User">User</option>
                <option value="Brand">Brand</option>
                <option value="Category">Category</option>
                <option value="Coupon">Coupon</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actor ID</label>
              <input
                type="text"
                value={actorSearch}
                onChange={(e) => { setActorSearch(e.target.value); setCurrentPage(1); }}
                placeholder="User UUID..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-550 transition-all outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tenant ID</label>
              <input
                type="text"
                value={tenantFilter}
                onChange={(e) => { setTenantFilter(e.target.value); setCurrentPage(1); }}
                placeholder="Tenant UUID..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-550 transition-all outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Branch ID</label>
              <input
                type="text"
                value={branchFilter}
                onChange={(e) => { setBranchFilter(e.target.value); setCurrentPage(1); }}
                placeholder="Branch UUID..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-550 transition-all outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warehouse ID</label>
              <input
                type="text"
                value={warehouseFilter}
                onChange={(e) => { setWarehouseFilter(e.target.value); setCurrentPage(1); }}
                placeholder="Warehouse UUID..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-550 transition-all outline-none"
              />
            </div>

            <div className="flex items-end">
              {(actionFilter || entityFilter || actorSearch || tenantFilter || branchFilter || warehouseFilter) && (
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2.5 text-xs font-black text-rose-500 hover:text-rose-600 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl border border-rose-500/10 transition-colors"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Logs Timeline */}
        {loadingLogs ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Scanning infrastructure logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-12 text-center space-y-3 border border-slate-100 dark:border-slate-800">
            <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white">No Security Logs Recorded</h3>
            <p className="text-xs text-slate-450 dark:text-slate-550 max-w-xs mx-auto">No auditable transactions matching this criteria were discovered on the system.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/80">
                      <th className="px-5 py-3.5 w-10"></th>
                      <th className="px-5 py-3.5 font-bold uppercase tracking-widest text-slate-400">Actor</th>
                      <th className="px-5 py-3.5 font-bold uppercase tracking-widest text-slate-400">Action</th>
                      <th className="px-5 py-3.5 font-bold uppercase tracking-widest text-slate-400">Partition (Tenant)</th>
                      <th className="px-5 py-3.5 font-bold uppercase tracking-widest text-slate-400">Target</th>
                      <th className="px-5 py-3.5 font-bold uppercase tracking-widest text-slate-400 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {logs.map((log) => {
                      const isExpanded = expandedLogId === log.id;
                      const badgeColor = ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200/50';

                      return (
                        <React.Fragment key={log.id}>
                          <tr className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors ${isExpanded ? 'bg-indigo-50/20 dark:bg-indigo-950/5' : ''}`}>
                            <td className="px-5 py-3.5">
                              <button
                                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-slate-400 hover:text-slate-650"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/10 flex items-center justify-center">
                                  <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400">{getInitials(log.actorName)}</span>
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white">{log.actorName || 'System Service'}</div>
                                  <div className="text-[9px] font-mono text-slate-400 max-w-[120px] truncate" title={log.actorId || ''}>{log.actorId || 'system-daemon'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[9px] font-black tracking-wider border ${badgeColor}`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-slate-800 dark:text-slate-200">ID Lookup</span>
                                <span className="text-[9px] font-mono text-slate-400 max-w-[140px] truncate" title={log.tenantId}>{log.tenantId}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white">{log.entity}</div>
                                  {log.entityId && (
                                    <div className="text-[9px] font-mono text-slate-400 max-w-[100px] truncate" title={log.entityId}>ID: {log.entityId}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right font-medium">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-end gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </div>
                              <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                                {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })}
                              </div>
                            </td>
                          </tr>

                          {/* Payload Details */}
                          {isExpanded && (
                            <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                              <td colSpan={6} className="px-8 py-5 border-t border-b border-slate-100 dark:border-slate-850">
                                <div className="space-y-4 animate-in slide-in-from-top-1 duration-200">
                                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest font-black">
                                    <span>Audit Payload Inspection</span>
                                    <span>Log UUID: {log.id}</span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                        Previous State (oldValue)
                                      </div>
                                      {log.oldValue ? (
                                        <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-300 font-mono text-[9px] overflow-auto max-h-[180px] scrollbar-thin border border-slate-850">
                                          {JSON.stringify(log.oldValue, null, 2)}
                                        </pre>
                                      ) : (
                                        <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-950/20 text-slate-400 text-center font-semibold border border-slate-200/50 dark:border-slate-800/40">
                                          No previous values recorded (Action: CREATE)
                                        </div>
                                      )}
                                    </div>

                                    <div className="space-y-1.5">
                                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        Applied Changes (newValue)
                                      </div>
                                      {log.newValue ? (
                                        <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-300 font-mono text-[9px] overflow-auto max-h-[180px] scrollbar-thin border border-slate-850">
                                          {JSON.stringify(log.newValue, null, 2)}
                                        </pre>
                                      ) : (
                                        <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-950/20 text-slate-400 text-center font-semibold border border-slate-200/50 dark:border-slate-800/40">
                                          No changes modified (Action: DELETE / READ)
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-150 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Page {currentPage} of {totalPages} ({totalLogs} Platform Logs)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-550 dark:text-slate-450 hover:text-indigo-600 disabled:opacity-40 transition-all active:scale-95 bg-white dark:bg-slate-950"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-550 dark:text-slate-450 hover:text-indigo-600 disabled:opacity-40 transition-all active:scale-95 bg-white dark:bg-slate-950"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
