'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Ban, BarChart3, CheckCircle2, ExternalLink, Filter, Search, Terminal, Layers, Info, X, Globe, CreditCard, Calendar, Activity, Loader2, Shield, Store } from 'lucide-react';
import { useState } from 'react';
import { fetchAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface Tenant {
  id: string;
  storeName: string;
  subdomain: string;
  customDomain?: string;
  status: string;
  subscriptionPlan?: { name: string };
  subscriptionBillingCycle?: string;
  subscriptionStatus?: string;
  subscriptionStartsAt?: string;
  subscriptionEndsAt?: string;
  createdAt: string;
  customDomainStatus?: string;
  sslEnabled?: boolean;
}

interface TenantListProps {
  initialTenants: Tenant[];
}

export default function TenantList({ initialTenants }: TenantListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants, setTenants] = useState(initialTenants);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const filteredTenants = tenants.filter((t) =>
    t.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setLoadingId(id);
    try {
      const res = await fetchAPI(`/super-admin/tenants/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.success) {
        setTenants(tenants.map(t => t.id === id ? { ...t, status: newStatus } : t));
        if (selectedTenant?.id === id) {
          setSelectedTenant({ ...selectedTenant, status: newStatus });
        }
        toast.success(`Store ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setLoadingId(null);
    }
  };

  const handleFetchDetails = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    try {
      const res = await fetchAPI(`/super-admin/tenants/${tenant.id}`);
      if (res.success) {
        setSelectedTenant(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch full tenant details');
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
          dot: 'bg-emerald-500',
          icon: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 text-indigo-500 shadow-sm shadow-indigo-500/10',
          gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20'
        };
      case 'suspended':
        return {
          bg: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
          dot: 'bg-rose-500',
          icon: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400',
          gradient: 'bg-slate-400 shadow-slate-400/20'
        };
      case 'expired':
        return {
          bg: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
          dot: 'bg-amber-500',
          icon: 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800 text-amber-500 shadow-sm shadow-amber-500/10',
          gradient: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-600 dark:bg-slate-900/20 dark:text-slate-400',
          dot: 'bg-slate-500',
          icon: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400',
          gradient: 'bg-slate-300 shadow-slate-300/20'
        };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Store Infrastructure</h1>
          <p className="text-slate-500 dark:text-slate-400">Total {tenants.length} merchants partitions active on the cluster.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm antialiased"
            />
          </div>
          <button className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Merchant Details</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Subscription Plan</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Sub Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Store Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Expiry Date</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Cluster Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Terminal className="w-8 h-8 opacity-20" />
                      <p className="italic font-medium">No records found matching criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredTenants.map((tenant) => {
                    const styles = getStatusStyles(tenant.status);
                    return (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={tenant.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-105 ${styles.icon}`}>
                              <Store className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 dark:text-white leading-tight capitalize">{tenant.storeName}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                {tenant.subdomain}
                                <span className="text-slate-300 dark:text-slate-600">.HOST.LOCAL</span>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                              {(tenant as any).subscriptionPlan?.name || 'Legacy Tier'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${tenant.subscriptionStatus === 'ACTIVE'
                              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                              }`}>
                              {tenant.subscriptionStatus || 'ACTIVE'}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                              {tenant.subscriptionBillingCycle || 'MONTHLY'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${styles.bg}`}>
                            <span className={`w-1 h-1 rounded-full ${styles.dot} ${tenant.status === 'active' ? 'animate-pulse' : ''}`} />
                            {tenant.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {tenant.subscriptionEndsAt
                              ? new Date(tenant.subscriptionEndsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                              : 'PERPETUAL'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleFetchDetails(tenant)}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-lg"
                              title="Quick Audit"
                            >
                              <Info className="w-5 h-5" />
                            </button>
                            {tenant.status === 'active' ? (
                              <button
                                onClick={() => handleUpdateStatus(tenant.id, 'suspended')}
                                disabled={loadingId === tenant.id}
                                className="p-2 text-slate-400 hover:text-rose-600 transition-colors bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-lg disabled:opacity-50"
                                title="Suspend Resource"
                              >
                                <Ban className="w-5 h-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(tenant.id, 'active')}
                                disabled={loadingId === tenant.id}
                                className="p-2 text-slate-400 hover:text-emerald-600 transition-colors bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-lg disabled:opacity-50"
                                title="Restore Resource"
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                            )}
                            <Link
                              href={`/system/tenants/${tenant.id}/analytics`}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-lg"
                              title="Resource Analytics"
                            >
                              <BarChart3 className="w-5 h-5" />
                            </Link>
                            <a
                              href={tenant.customDomain ? tenant.customDomain : `http://${tenant.subdomain}.localhost:3000`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-lg"
                              title="Access Partition"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Details Modal */}
      <AnimatePresence>
        {selectedTenant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTenant(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Header */}
              <div className="p-8 pb-0 flex justify-between items-start">
                {(() => {
                  const styles = getStatusStyles(selectedTenant.status);
                  return (
                    <>
                      <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all ${styles.gradient}`}>
                          <Store className="w-10 h-10" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white capitalize">{selectedTenant.storeName}</h2>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${styles.bg}`}>
                              {selectedTenant.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <Terminal className="w-3.5 h-3.5" />
                              {selectedTenant.subdomain}.host.local
                            </span>
                            {selectedTenant.customDomain && (
                              <>
                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 uppercase tracking-widest">
                                  <Globe className="w-3.5 h-3.5" />
                                  {selectedTenant.customDomain}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedTenant(null)}
                        className="p-4 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-3xl transition-all"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </>
                  );
                })()}
              </div>

              {/* Content */}
              <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cluster Metadata */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Shield className="w-3 h-3" /> Custom Domain Status
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                          {selectedTenant.customDomainStatus || 'NONE'}
                        </span>
                        {selectedTenant.sslEnabled && (
                          <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase">SSL Secured</span>
                        )}
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Provisioned On
                      </p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {new Date(selectedTenant.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Infrastructure Analytics Snapshot</h3>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      {[
                        { label: 'Uptime', value: '99.9%', color: 'text-emerald-500', icon: Activity },
                        { label: 'Latency', value: '42ms', color: 'text-indigo-500', icon: Activity },
                        { label: 'Nodes', value: '2 Active', color: 'text-slate-700', icon: Layers },
                        { label: 'Health', value: 'Nominal', color: 'text-emerald-500', icon: CheckCircle2 },
                      ].map((stat, i) => (
                        <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                          <p className={`text-sm font-black ${stat.color} dark:brightness-110`}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleUpdateStatus(selectedTenant.id, selectedTenant.status === 'active' ? 'suspended' : 'active')}
                      disabled={loadingId === selectedTenant.id}
                      className={`flex-1 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 shadow-2xl ${selectedTenant.status === 'active'
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                        }`}
                    >
                      {loadingId === selectedTenant.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : selectedTenant.status === 'active' ? (
                        <>
                          <Ban className="w-5 h-5" />
                          Suspend Resource
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Activate Resource
                        </>
                      )}
                    </button>
                    <Link
                      href={`/system/tenants/${selectedTenant.id}/analytics`}
                      className="px-8 py-5 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center gap-3"
                    >
                      <BarChart3 className="w-5 h-5" />
                      Full Audit
                    </Link>
                  </div>
                </div>

                {/* Subscription Card */}
                <div className="relative overflow-hidden p-8 bg-slate-950 rounded-[2.5rem] text-white shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-3xl -ml-16 -mb-16" />

                  <div className="relative space-y-8 h-full flex flex-col">
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Subscription Plan</p>
                      <h4 className="text-3xl font-black">{selectedTenant.subscriptionPlan?.name || 'Legacy Tier'}</h4>
                      <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">{selectedTenant.subscriptionBillingCycle || 'MONTHLY'} Billing</p>
                    </div>

                    <div className="space-y-4 flex-1">
                      <div className="flex justify-between items-center py-4 border-b border-white/10">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</span>
                        <span className={`text-xs font-black uppercase tracking-widest ${selectedTenant.subscriptionStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {selectedTenant.subscriptionStatus || 'ACTIVE'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-white/10">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Started</span>
                        <span className="text-xs font-bold font-mono">
                          {selectedTenant.subscriptionStartsAt ? new Date(selectedTenant.subscriptionStartsAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-white/10">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Renewal</span>
                        <span className="text-xs font-bold font-mono text-indigo-400">
                          {selectedTenant.subscriptionEndsAt ? new Date(selectedTenant.subscriptionEndsAt).toLocaleDateString() : 'PERPETUAL'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-8">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-indigo-400" />
                        <div className="flex-1">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Auto Renewal</p>
                          <p className="text-[10px] font-bold">Billing Gateway Active</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
