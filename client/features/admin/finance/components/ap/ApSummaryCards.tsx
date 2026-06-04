'use client';

import { CreditCard, FileText, TrendingDown } from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';

export interface ApSummaryCardsProps {
    totalOutstanding: number;
    totalOverdue: number;
    supplierCount: number;
}

export default function ApSummaryCards({ totalOutstanding, totalOverdue, supplierCount }: ApSummaryCardsProps) {
    const { formatPrice } = useSettings();
    const agingRatio = totalOutstanding > 0 ? ((totalOverdue / totalOutstanding) * 100).toFixed(1) : '0.0';

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Accounts Payable</p>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                    {formatPrice(totalOutstanding)}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1.5">{supplierCount} suppliers with balances</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Overdue AP</p>
                </div>
                <p className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight font-mono">
                    {formatPrice(totalOverdue)}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1.5">Aged liability (1-90+ days)</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aging Ratio</p>
                </div>
                <p className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
                    {agingRatio}%
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1.5">Percentage of liability overdue</p>
            </div>
        </div>
    );
}
