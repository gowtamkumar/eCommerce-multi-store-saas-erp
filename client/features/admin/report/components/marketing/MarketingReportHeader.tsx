'use client';

import { Download, RefreshCcw, Sparkles } from 'lucide-react';

export interface MarketingReportHeaderProps {
    loading: boolean;
    canExport: boolean;
    onRefresh: () => void;
    onExport: () => void;
    currencyCode?: string;
    currencySymbol?: string;
}

export default function MarketingReportHeader({
    loading,
    canExport,
    onRefresh,
    onExport,
    currencyCode,
    currencySymbol,
}: MarketingReportHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div>
                <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-brand-600" />
                    Marketing &amp; Loyalty Dashboard
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Unified marketing overview including campaign dispatch rates, coupon conversions, promotion discounts, and customer loyalty.
                    {currencyCode && currencySymbol && (
                        <span className="ml-2 text-xs font-bold text-brand-600 dark:text-brand-400">
                            · {currencyCode} ({currencySymbol})
                        </span>
                    )}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onRefresh}
                    className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-900/80 text-slate-500 dark:text-slate-400 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                    onClick={onExport}
                    disabled={loading || !canExport}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl transition-all font-semibold border border-transparent disabled:opacity-50 text-sm shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    Export Master Report
                </button>
            </div>
        </div>
    );
}
