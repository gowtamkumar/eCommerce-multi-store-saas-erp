'use client';

import { Download, Loader2, TrendingUp } from 'lucide-react';
import type { SalesAnalysisHeaderProps, SalesReportPeriod } from '../../types';

const PERIOD_OPTIONS: Array<{ value: SalesReportPeriod; label: string }> = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
];

export default function SalesAnalysisHeader({
    period,
    isExporting,
    onPeriodChange,
    onExport,
}: SalesAnalysisHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div>
                <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-brand-600" />
                    Sales Analysis
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Track your store performance and sales trends</p>
            </div>

            <div className="flex items-center gap-3">
                <select
                    value={period}
                    onChange={(event) => onPeriodChange(event.target.value as SalesReportPeriod)}
                    className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                >
                    {PERIOD_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={onExport}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium border border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    {isExporting ? 'Exporting...' : 'Export CSV'}
                </button>
            </div>
        </div>
    );
}
