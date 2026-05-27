'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Clock,
  MousePointer2,
  Store,
  Users,
  Globe,
  TrendingUp,
  Shield,
  Calendar,
  Layers,
  CheckCircle2,
  Ban,
  Loader2,
  CreditCard,
  ExternalLink,
  Terminal,
} from 'lucide-react';
import Link from 'next/link';
import { fetchSuperAdminAPI } from '@/services/supperAdminApi';
import toast from 'react-hot-toast';
import { Tenant } from '../types/tenant.types';

interface TopPage {
  path: string;
  hits: number;
  lastUpdated: string;
}

interface TenantAnalyticsProps {
  tenantId: string;
  data: {
    counts: {
      users: number;
      products: number;
      orders: number;
      pages: number;
    };
    topPages: TopPage[];
  };
  tenant: Tenant;
}

export default function TenantAnalytics({ tenantId, data, tenant: initialTenant }: TenantAnalyticsProps) {
  const [currentTenant, setCurrentTenant] = useState<Tenant>(initialTenant);
  const [features, setFeatures] = useState<any[]>([]);
  const [fetchingFeatures, setFetchingFeatures] = useState(false);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchFeatures = async () => {
      setFetchingFeatures(true);
      try {
        const res = await fetchSuperAdminAPI(`/super-admin/tenants/${tenantId}/features`);
        if (res.success) {
          setFeatures(res.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch features:', error);
      } finally {
        setFetchingFeatures(false);
      }
    };

    fetchFeatures();
  }, [tenantId]);

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetchSuperAdminAPI(`/super-admin/tenants/${tenantId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setCurrentTenant((prev) => ({ ...prev, status: newStatus }));
        toast.success(`Store ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleToggleFeature = async (featureSlug: string, overrideValue: boolean | null) => {
    setTogglingSlug(featureSlug);
    try {
      const res = await fetchSuperAdminAPI(`/super-admin/tenants/${tenantId}/features`, {
        method: 'PATCH',
        body: JSON.stringify({ featureSlug, overrideValue }),
      });
      if (res.success) {
        const refetch = await fetchSuperAdminAPI(`/super-admin/tenants/${tenantId}/features`);
        if (refetch.success) {
          setFeatures(refetch.data || []);
        }
        toast.success('Feature override updated successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update feature override');
    } finally {
      setTogglingSlug(null);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/20',
          dot: 'bg-emerald-500',
          icon: 'bg-emerald-500 border-emerald-400/30 text-white',
          gradient: 'from-emerald-500 to-teal-600',
        };
      case 'suspended':
        return {
          bg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-500/20',
          dot: 'bg-rose-500',
          icon: 'bg-rose-500 border-rose-400/30 text-white',
          gradient: 'from-rose-500 to-red-600',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border border-slate-500/20',
          dot: 'bg-slate-450',
          icon: 'bg-slate-500 border-slate-400/30 text-white',
          gradient: 'from-slate-500 to-slate-600',
        };
    }
  };

  const styles = getStatusStyles(currentTenant.status);

  const stats = [
    { label: 'Merchant Users', value: data.counts.users, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-500/20' },
    { label: 'Total Products', value: data.counts.products, icon: Store, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-500/20' },
    { label: 'Customer Orders', value: data.counts.orders, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-500/20' },
    { label: 'Store Pages', value: data.counts.pages, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-500/20' },
  ];

  return (
    <div className="space-y-10 pb-12 antialiased">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-6">
          <Link
            href="/system"
            className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:scale-105 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
          </Link>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${styles.gradient} flex items-center justify-center text-white shadow-lg`}>
              <Store className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white capitalize leading-none">
                  {currentTenant.storeName}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${styles.bg}`}>
                  {currentTenant.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                <span className="flex items-center gap-1 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  <Terminal className="w-3.5 h-3.5" />
                  {currentTenant.subdomain}.host.local
                </span>
                {currentTenant.customDomain && (
                  <>
                    <div className="w-1.5 h-1.5 bg-slate-350 dark:bg-slate-650 rounded-full" />
                    <span className="flex items-center gap-1 text-indigo-500 font-bold uppercase tracking-widest text-[10px]">
                      <Globe className="w-3.5 h-3.5" />
                      {currentTenant.customDomain}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full lg:w-auto">
          <button
            onClick={() => handleUpdateStatus(currentTenant.status === 'active' ? 'suspended' : 'active')}
            disabled={updatingStatus}
            className={`flex-1 lg:flex-initial px-6 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2.5 shadow-md ${
              currentTenant.status === 'active'
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
            }`}
          >
            {updatingStatus ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : currentTenant.status === 'active' ? (
              <>
                <Ban className="w-4 h-4" />
                Suspend Store
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Activate Store
              </>
            )}
          </button>
          <a
            href={currentTenant.customDomain ? currentTenant.customDomain : `http://${currentTenant.subdomain}.localhost:3000`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-wider text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center justify-center gap-2 border border-indigo-150 dark:border-indigo-800/50 shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Access Store
          </a>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Stats, Feature Overrides, Traffic */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden"
              >
                <div className={`w-12 h-12 ${s.bg} dark:bg-slate-900/50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{s.value.toLocaleString()}</p>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feature Flags & Overrides */}
          <div className="p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-150 dark:border-slate-750 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Feature Overrides</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Manage database overrides and custom add-ons</p>
              </div>
              {fetchingFeatures && (
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              )}
            </div>

            {features.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No features available on this cluster.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[30rem] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {features.map((feat) => {
                  const isToggling = togglingSlug === feat.slug;
                  return (
                    <div
                      key={feat.slug}
                      className="flex flex-col justify-between p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-all gap-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full ${feat.isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">{feat.slug}</p>
                        </div>
                        <div className="flex gap-1">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                            feat.isPlanFeature
                              ? 'bg-slate-200/60 text-slate-500 dark:bg-slate-900 dark:text-slate-400'
                              : 'bg-amber-100 text-amber-600 dark:bg-amber-950/20'
                          }`}>
                            {feat.isPlanFeature ? 'Plan' : 'Add-on'}
                          </span>
                          {feat.isOverridden && (
                            <span className="text-[8px] font-black bg-indigo-50 text-indigo-500 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded uppercase">
                              Overridden
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[8px] text-slate-450 font-bold uppercase tracking-wider">
                          {feat.isOverridden ? 'Status: Custom override' : 'Status: Plan default'}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleToggleFeature(feat.slug, true)}
                            disabled={isToggling}
                            className={`px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${
                              feat.isOverridden && feat.overrideValue === true
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            Enable
                          </button>
                          <button
                            onClick={() => handleToggleFeature(feat.slug, false)}
                            disabled={isToggling}
                            className={`px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${
                              feat.isOverridden && feat.overrideValue === false
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            Disable
                          </button>
                          {feat.isOverridden && (
                            <button
                              onClick={() => handleToggleFeature(feat.slug, null)}
                              disabled={isToggling}
                              className="px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Traffic Hotspots Table */}
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-150 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 dark:border-slate-750 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/10">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Traffic Hotspots</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Resource engagement metrics</p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-[18px] shadow-sm">
                <MousePointer2 className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/20 dark:bg-slate-900/30">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Path</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Hits</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Last Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {data.topPages.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-350">
                          <Globe className="w-10 h-10 opacity-30 animate-pulse" strokeWidth={1.5} />
                          <p className="text-[10px] font-black uppercase tracking-widest italic">No active requests logged</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.topPages.map((page, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-slate-350 group-hover:text-indigo-500 transition-colors">{(i + 1).toString().padStart(2, '0')}</span>
                            <span className="text-sm font-bold text-slate-750 dark:text-slate-200 font-mono tracking-tighter group-hover:translate-x-1 transition-transform">{page.path}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-650 dark:text-indigo-400 rounded-lg text-xs font-black font-mono shadow-sm border border-indigo-100/50 dark:border-indigo-900/30">
                            {page.hits.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-400 uppercase">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(page.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Sidebar */}
        <div className="space-y-8">
          {/* Subscription Tier Card */}
          <div className="relative overflow-hidden p-8 bg-slate-950 rounded-[2.5rem] text-white shadow-xl border border-slate-900">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-3xl -ml-16 -mb-16" />

            <div className="relative space-y-8 flex flex-col justify-between h-full">
              <div>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-3 h-3" />
                  Subscription Plan
                </p>
                <h4 className="text-3xl font-black">{currentTenant.subscriptionPlan?.name || 'Legacy Tier'}</h4>
                <p className="text-slate-450 text-[10px] font-black mt-1 uppercase tracking-widest">{currentTenant.subscriptionBillingCycle || 'MONTHLY'} Billing</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3.5 border-b border-white/5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${currentTenant.subscriptionStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {currentTenant.subscriptionStatus || 'ACTIVE'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3.5 border-b border-white/5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Started</span>
                  <span className="text-xs font-bold font-mono">
                    {currentTenant.subscriptionStartsAt ? new Date(currentTenant.subscriptionStartsAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3.5 border-b border-white/5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Renewal</span>
                  <span className="text-xs font-bold font-mono text-indigo-400">
                    {currentTenant.subscriptionEndsAt ? new Date(currentTenant.subscriptionEndsAt).toLocaleDateString() : 'PERPETUAL'}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <div className="flex-1">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Auto Renewal</p>
                    <p className="text-[10px] font-bold">Billing Gateway Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resource Load snapshot */}
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-150 dark:border-slate-700 p-8 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Resource Load</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tenant partition usage</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/10">Real-time</span>
            </div>
            <div className="space-y-6">
              {[
                { label: 'Users', val: data.counts.users, max: Math.max(data.counts.users * 1.5, 10), color: 'bg-indigo-500' },
                { label: 'Products', val: data.counts.products, max: Math.max(data.counts.products * 1.5, 100), color: 'bg-emerald-500' },
                { label: 'Orders', val: data.counts.orders, max: Math.max(data.counts.orders * 1.5, 50), color: 'bg-amber-500' },
                { label: 'Pages', val: data.counts.pages, max: Math.max(data.counts.pages * 1.5, 20), color: 'bg-blue-500' },
              ].map((item) => (
                <div key={item.label} className="group">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.label}</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{item.val}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((item.val / item.max) * 100, 100)}%` }}
                      className={`h-full ${item.color}`}
                      transition={{ duration: 1, ease: 'circOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Health details */}
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-150 dark:border-slate-700 p-8 flex flex-col shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-500" />
              Cluster Diagnostics
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              {[
                { label: 'Uptime', value: '99.9%', color: 'text-emerald-500', icon: Activity },
                { label: 'Latency', value: '42ms', color: 'text-indigo-500', icon: Activity },
                { label: 'Nodes', value: '2 Active', color: 'text-slate-700 dark:text-slate-300', icon: Layers },
                { label: 'Health', value: 'Nominal', color: 'text-emerald-500', icon: CheckCircle2 },
              ].map((stat, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-450 uppercase tracking-widest mb-2">{stat.label}</p>
                  <p className={`text-xs font-black ${stat.color} dark:brightness-110`}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 rounded-2xl mt-4">
              <p className="text-[8px] font-black text-slate-450 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Provisioned On
              </p>
              <p className="text-xs font-bold text-slate-750 dark:text-slate-350">
                {new Date(currentTenant.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
