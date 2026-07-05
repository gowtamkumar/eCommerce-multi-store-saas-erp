'use client';

import { Loader2, Play, RefreshCw } from 'lucide-react';

export interface ArHeaderProps {
    runningAudit: boolean;
    loading: boolean;
    onRunAudit: () => void;
    onRefresh: () => void;
    currencyCode?: string;
    currencySymbol?: string;
}

export default function ArHeader({
    runningAudit,
    loading,
    onRunAudit,
    onRefresh,
    currencyCode,
    currencySymbol,
}: ArHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Accounts Receivable & Dunning</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    B2B customer debt aging, credit limits, automated dunning rules, and logs
                    {currencyCode && currencySymbol && (
                        <span className="ml-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            · {currencyCode} ({currencySymbol})
                        </span>
                    )}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onRunAudit}
                    disabled={runningAudit}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-sm font-semibold disabled:opacity-50 shadow-md shadow-indigo-500/10"
                >
                    {runningAudit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Run Dunning Audit
                </button>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-semibold disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>
        </div>
    );
}
