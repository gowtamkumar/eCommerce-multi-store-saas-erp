'use client';

import { RefreshCw } from 'lucide-react';
import type { FinanceSummaryHeaderProps } from '../../types';

export default function FinanceSummaryHeader({ onRefresh, isLoading }: FinanceSummaryHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display">Finance Summary</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time health of your business finances</p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Total Analytics
                </button>
            </div>
        </div>
    );
}
