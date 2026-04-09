'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Store, Terminal, Globe, X, Shield, Calendar, Activity, Layers, CheckCircle2, Ban, Loader2, BarChart3, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Tenant, StatusStyles } from '../types/tenant.types';

interface TenantDetailsModalProps {
  selectedTenant: Tenant | null;
  loadingId: string | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: string) => void;
  getStatusStyles: (status: string) => StatusStyles;
}

const TenantDetailsModal = ({
  selectedTenant,
  loadingId,
  onClose,
  onUpdateStatus,
  getStatusStyles,
}: TenantDetailsModalProps) => {
  if (!selectedTenant) return null;

  const styles = getStatusStyles(selectedTenant.status);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
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
              onClick={onClose}
              className="p-4 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-3xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
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
                  onClick={() => onUpdateStatus(selectedTenant.id, selectedTenant.status === 'active' ? 'suspended' : 'active')}
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
                  onClick={onClose}
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
    </AnimatePresence>
  );
};

export default React.memo(TenantDetailsModal);
