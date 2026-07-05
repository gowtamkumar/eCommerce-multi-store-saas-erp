'use client';

import { BarChart3, Calendar, Download, Filter } from 'lucide-react';
import React from 'react';
import type { ProfitLossHeaderProps } from '../../types';

export default function ProfitLossHeader({
    startDate,
    endDate,
    onDateChange,
    onFilter,
    currencyCode,
    currencySymbol,
}: ProfitLossHeaderProps) {
    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFilter();
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div>
                <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-brand-600" />
                    Profit & Loss Report
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Summary of revenue, COGS, and expenses
                    {currencyCode && currencySymbol && (
                        <span className="ml-2 text-xs font-bold text-brand-600 dark:text-brand-400">
                            · {currencyCode} ({currencySymbol})
                        </span>
                    )}
                </p>
            </div>

            <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onDateChange('startDate', e.target.value)}
                        className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                    />
                </div>
                <span className="text-slate-400">to</span>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onDateChange('endDate', e.target.value)}
                        className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                    />
                </div>
                <button
                    type="submit"
                    className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20 active:scale-95"
                    title="Apply Filters"
                >
                    <Filter className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors active:scale-95"
                >
                    <Download className="w-4 h-4" />
                    Print
                </button>
            </form>
        </div>
    );
}
