'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { planColor } from '../../lib/dashboard';
import type { RankedTenantAnalytics, TenantAnalytics } from '../../types/dashboard.types';

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
      <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${planColor(t.subscriptionPlan?.name)} text-white`}>
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

export default function TopStoresTable({ analytics }: { analytics: TenantAnalytics[] }) {
  const topActiveStores = useMemo<RankedTenantAnalytics[]>(
    () =>
      [...analytics]
        .sort((a, b) => (b.stats?.orders || 0) - (a.stats?.orders || 0))
        .slice(0, 5)
        .map((t, idx) => ({ ...t, rank: idx + 1 })),
    [analytics],
  );

  if (analytics.length === 0) return null;

  return (
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
        getRowKey={(t) => t.id}
        containerClassName="border-0 shadow-none rounded-t-none rounded-b-3xl bg-transparent"
      />
    </div>
  );
}
