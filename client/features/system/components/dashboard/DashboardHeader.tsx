'use client';

import Link from 'next/link';
import { Download, RefreshCw } from 'lucide-react';

const DAYS_OPTIONS = [
  { label: '7 Days', value: 7 },
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
];

interface DashboardHeaderProps {
  totalTenants: number;
  lastRefreshed: Date;
  days: number;
  onDaysChange: (days: number) => void;
  onRefresh: () => void;
  onExport: () => void;
  isRefreshing: boolean;
  isExporting: boolean;
}

export default function DashboardHeader({
  totalTenants,
  lastRefreshed,
  days,
  onDaysChange,
  onRefresh,
  onExport,
  isRefreshing,
  isExporting,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Control Center</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Monitoring <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalTenants}</span> merchants.{' '}
          <span className="text-xs text-slate-400">
            Last refreshed: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </p>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
          {DAYS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onDaysChange(opt.value)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                days === opt.value
                  ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
        </button>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
        <Link
          href="/system/tenants"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-semibold hover:bg-indigo-700 transition-all text-sm"
        >
          Manage Stores
        </Link>
      </div>
    </div>
  );
}
