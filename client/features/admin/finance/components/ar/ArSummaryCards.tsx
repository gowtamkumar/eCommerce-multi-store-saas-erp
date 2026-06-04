'use client';

import { AlertTriangle, CreditCard, TrendingDown } from 'lucide-react';

export interface ArSummaryCardsProps {
    totalOutstanding: number;
    totalOverdue: number;
    holdCount: number;
    accountCount: number;
}

export default function ArSummaryCards({ totalOutstanding, totalOverdue, holdCount, accountCount }: ArSummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Outstanding</p>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-400 mt-1">{accountCount} active B2B accounts</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Total Overdue</p>
                </div>
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                    ${totalOverdue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-400 mt-1">Past due invoices (1-90+ days)</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${holdCount > 0 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                        <AlertTriangle className={`w-5 h-5 ${holdCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Credit Hold</p>
                </div>
                <p className={`text-2xl font-black font-mono ${holdCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {holdCount} accounts
                </p>
                <p className="text-xs text-slate-400 mt-1">Blocked from on-account purchases</p>
            </div>
        </div>
    );
}
