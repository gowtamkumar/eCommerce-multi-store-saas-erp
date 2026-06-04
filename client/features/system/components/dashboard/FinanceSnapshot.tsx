'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AlertCircle, ChevronRight, DollarSign, TrendingUp, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { BillingOverview } from '../../types/dashboard.types';

interface FinanceCard {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  color: string;
}

interface FinanceSnapshotProps {
  billing: BillingOverview | null;
  isRefreshing: boolean;
}

export default function FinanceSnapshot({ billing, isRefreshing }: FinanceSnapshotProps) {
  const cards = useMemo<FinanceCard[]>(
    () => [
      { label: 'All-Time Revenue', value: formatCurrency(billing?.totalRevenue || 0), sub: 'Gross settled payments', icon: DollarSign, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
      { label: 'Monthly Recurring', value: formatCurrency(billing?.mrr || 0), sub: 'Current month MRR', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
      { label: 'Annual Recurring', value: formatCurrency(billing?.arr || 0), sub: 'MRR extrapolated × 12', icon: Wallet, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
      { label: 'Failed Payments', value: (billing?.failedCount || 0).toLocaleString(), sub: 'Requires attention', icon: AlertCircle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' },
    ],
    [billing],
  );

  return (
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
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/40">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white truncate mt-0.5">
                  {isRefreshing && !billing ? (
                    <span className="inline-block w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  ) : (
                    card.value
                  )}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-tight opacity-75">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
