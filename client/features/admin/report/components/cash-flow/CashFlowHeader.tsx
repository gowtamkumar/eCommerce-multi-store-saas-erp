'use client';

import { Download, Loader2, Wallet } from 'lucide-react';
import React from 'react';
import type { CashFlowHeaderProps } from '../../types';


const CashFlowHeader: React.FC<CashFlowHeaderProps> = React.memo(({ onExport, isExporting }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div>
                <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-brand-600" />
                    Cash Flow Summary
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Unified tracking of money movement in and out of your business</p>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onExport}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    {isExporting ? 'Exporting…' : 'Export CSV'}
                </button>
            </div>
        </div>
    );
})

CashFlowHeader.displayName = 'CashFlowHeader';

export default CashFlowHeader;
