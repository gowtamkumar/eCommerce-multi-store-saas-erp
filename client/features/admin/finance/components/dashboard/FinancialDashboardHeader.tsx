'use client';

import { BarChart3, Loader2, RefreshCw, Zap } from 'lucide-react';

export interface FinancialDashboardHeaderProps {
    initializing: boolean;
    onInitialize: () => void;
    onRefresh: () => void;
}

export default function FinancialDashboardHeader({
    initializing,
    onInitialize,
    onRefresh,
}: FinancialDashboardHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-violet-600" />
                    Financial Engine
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Real-time P&amp;L and Balance Sheet powered by automated double-entry accounting.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onInitialize}
                    disabled={initializing}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-xl text-sm font-bold hover:bg-violet-200 transition-all"
                >
                    {initializing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Initialize COA
                </button>
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>
        </div>
    );
}
