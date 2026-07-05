'use client';

import { FileDown } from 'lucide-react';
import React from 'react';
import type { ReportExportHeaderProps } from '../../types';

const ReportExportHeader: React.FC<ReportExportHeaderProps> = ({ currencyCode, currencySymbol }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 text-center animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group hover:scale-110 transition-transform">
                <FileDown className="w-8 h-8 text-brand-600" />
            </div>
            <h1 className="text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight">Export Financial Data</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto font-medium">
                Generate and download CSV reports compatible with Excel and Quickbooks for your accounting needs.
                {currencyCode && currencySymbol && (
                    <span className="block mt-2 text-xs font-bold text-brand-600 dark:text-brand-400">
                        · {currencyCode} ({currencySymbol})
                    </span>
                )}
            </p>
        </div>
    );
};

export default React.memo(ReportExportHeader);
