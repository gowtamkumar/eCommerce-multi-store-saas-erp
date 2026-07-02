'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronRight, Clock, CreditCard, XCircle } from 'lucide-react';
import { ACTION_TONES, storeStatusHref } from '../../lib/dashboard';
import type { ActionItem, BillingOverview, DashboardStats } from '../../types/dashboard.types';

interface ActionCenterProps {
  stats: DashboardStats;
  billing: BillingOverview | null;
}

export default function ActionCenter({ stats, billing }: ActionCenterProps) {
  const items = useMemo<ActionItem[]>(() => {
    const result: ActionItem[] = [];
    const suspended = stats.statuses?.suspended || 0;
    const expired = stats.statuses?.expired || 0;
    const trial = stats.statuses?.trial || 0;

    if (billing?.failedCount) {
      result.push({
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
      result.push({
        id: 'suspended',
        label: 'Suspended stores',
        detail: 'Merchants currently blocked',
        count: suspended,
        href: storeStatusHref('suspended'),
        tone: 'rose',
        icon: <XCircle className="w-4 h-4" />,
      });
    }
    if (expired) {
      result.push({
        id: 'expired',
        label: 'Expired subscriptions',
        detail: 'Lapsed plans to win back',
        count: expired,
        href: storeStatusHref('expired'),
        tone: 'amber',
        icon: <AlertTriangle className="w-4 h-4" />,
      });
    }
    if (trial) {
      result.push({
        id: 'trial',
        label: 'Trials in progress',
        detail: 'Convert before they expire',
        count: trial,
        href: storeStatusHref('trial'),
        tone: 'indigo',
        icon: <Clock className="w-4 h-4" />,
      });
    }
    if (billing?.pendingCount) {
      result.push({
        id: 'pending',
        label: 'Pending invoices',
        detail: 'Awaiting settlement',
        count: billing.pendingCount,
        href: '/system/billing',
        tone: 'amber',
        icon: <Clock className="w-4 h-4" />,
      });
    }
    return result;
  }, [stats.statuses, billing]);

  if (items.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Action Center</h2>
          <p className="text-xs text-slate-500">Platform items that need your attention</p>
        </div>
        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
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
  );
}
