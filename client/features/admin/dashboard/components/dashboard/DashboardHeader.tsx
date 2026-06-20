'use client';

import { RefreshCw } from 'lucide-react';
import type { DashboardPeriod } from '../../types';

interface DashboardHeaderProps {
    period: DashboardPeriod;
    setPeriod: (period: DashboardPeriod) => void;
    loading: boolean;
    lastUpdated: Date | null;
    onRefresh: () => void;
}

export default function DashboardHeader({
    period,
    setPeriod,
    loading,
    lastUpdated,
    onRefresh,
}: DashboardHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display flex items-center gap-3">
                    Dashboard <span className="text-brand-600 italic">Overview</span>
                </h1>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">
                    Real-time performance metrics
                    {lastUpdated && (
                        <span className="text-slate-400 normal-case tracking-normal font-medium ml-2">
                            · Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-brand-600 hover:border-brand-500/30 transition-all disabled:opacity-50"
                    title="Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                    {(['day', 'week', 'month'] as const).map((nextPeriod) => (
                        <button
                            key={nextPeriod}
                            onClick={() => setPeriod(nextPeriod)}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${period === nextPeriod
                                ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {nextPeriod}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
