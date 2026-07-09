'use client';

import { RefreshCw } from 'lucide-react';

export interface ApHeaderProps {
    loading: boolean;
    onRefresh: () => void;
    currencyCode?: string;
    currencySymbol?: string;
}

export default function ApHeader({
    loading,
    onRefresh,
    currencyCode,
    currencySymbol,
}: ApHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Accounts Payable & Payment Runs</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                    Track vendor liability aging categories and execute batch payment matching sweeps
                    {currencyCode && currencySymbol && (
                        <span className="ml-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            · {currencyCode} ({currencySymbol})
                        </span>
                    )}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>
        </div>
    );
}
