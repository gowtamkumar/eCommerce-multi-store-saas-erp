'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { planColor, storeStatusHref } from '../../lib/dashboard';
import type { DashboardStats } from '../../types/dashboard.types';

const STATUS_ICONS: Record<string, ReactNode> = {
  active: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  trial: <Clock className="w-4 h-4 text-amber-500" />,
  suspended: <XCircle className="w-4 h-4 text-rose-500" />,
  expired: <AlertTriangle className="w-4 h-4 text-orange-500" />,
};

export default function PlanDistribution({ stats }: { stats: DashboardStats }) {
  const planEntries = Object.entries(stats.plans);
  const statusEntries = Object.entries(stats.statuses);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Plan Distribution</h2>
      <p className="text-xs text-slate-400 mb-6">{stats.totalStores} stores total</p>
      <div className="space-y-5">
        {planEntries.length === 0 ? (
          <p className="text-sm text-slate-400 italic text-center py-4">No store data yet</p>
        ) : (
          planEntries.map(([plan, count]) => (
            <div key={plan}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">{plan}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {count} <span className="text-slate-400 font-normal text-xs">stores</span>
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.totalStores > 0 ? (count / stats.totalStores) * 100 : 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${planColor(plan)}`}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {statusEntries.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Store Status</h3>
          <div className="grid grid-cols-2 gap-3">
            {statusEntries.map(([status, count]) => (
              <Link
                key={status}
                href={storeStatusHref(status)}
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
  );
}
