'use client';

import { RefreshCw, TrendingUp } from 'lucide-react';

export interface ProfitLossHeaderProps {
    onRefresh: () => void;
}

export default function ProfitLossHeader({ onRefresh }: ProfitLossHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-8 h-8 text-indigo-600" /> Profit &amp; Loss
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                    General Ledger backed income statement with real-time transactional double-entry tracking
                </p>
            </div>
            <button
                onClick={onRefresh}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-xs font-black uppercase tracking-widest"
            >
                <RefreshCw className="w-4 h-4" /> Refresh
            </button>
        </div>
    );
}
