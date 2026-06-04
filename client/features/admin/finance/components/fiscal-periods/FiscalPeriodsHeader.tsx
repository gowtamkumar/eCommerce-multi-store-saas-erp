'use client';

import { Plus } from 'lucide-react';

export interface FiscalPeriodsHeaderProps {
    onCreate: () => void;
}

export default function FiscalPeriodsHeader({ onCreate }: FiscalPeriodsHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
                    Fiscal <span className="text-indigo-600">Periods</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
                    Lock Postings &amp; Enforce Financial Audit Control
                </p>
            </div>
            <button
                onClick={onCreate}
                className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-2 self-start"
            >
                <Plus className="w-4 h-4" /> New Fiscal Period
            </button>
        </div>
    );
}
