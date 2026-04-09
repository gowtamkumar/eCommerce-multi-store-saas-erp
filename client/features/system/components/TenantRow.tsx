'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, Ban, ExternalLink, Info, Store, Layers } from 'lucide-react';
import Link from 'next/link';
import { Tenant, StatusStyles } from '../types/tenant.types';

interface TenantRowProps {
  tenant: Tenant;
  styles: StatusStyles;
  loadingId: string | null;
  onUpdateStatus: (id: string, newStatus: string) => void;
  onFetchDetails: (tenant: Tenant) => void;
}

const TenantRow = ({
  tenant,
  styles,
  loadingId,
  onUpdateStatus,
  onFetchDetails,
}: TenantRowProps) => {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
            {tenant.subscriptionPlan?.name || 'Legacy Tier'}
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
            onClick={() => onFetchDetails(tenant)}
            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-lg"
            title="Quick Audit"
          >
            <Info className="w-5 h-5" />
          </button>
          {tenant.status === 'active' ? (
            <button
              onClick={() => onUpdateStatus(tenant.id, 'suspended')}
              disabled={loadingId === tenant.id}
              className="p-2 text-slate-400 hover:text-rose-600 transition-colors bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-lg disabled:opacity-50"
              title="Suspend Resource"
            >
              <Ban className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => onUpdateStatus(tenant.id, 'active')}
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
};

export default React.memo(TenantRow);
