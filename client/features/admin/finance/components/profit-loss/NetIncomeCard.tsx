'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';

export interface NetIncomeCardProps {
    netProfit: number;
    netMargin: string;
    isProfitable: boolean;
    formatPrice: (amount: number) => string;
}

export default function NetIncomeCard({ netProfit, netMargin, isProfitable, formatPrice }: NetIncomeCardProps) {
    return (
        <div className={`p-6 rounded-4xl border-2 mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isProfitable ? 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-950/20' : 'bg-rose-50/30 border-rose-100 dark:bg-rose-950/10 dark:border-rose-950/20'}`}>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Income / Bottom Line</p>
                <p className={`text-3xl font-black mt-1 font-mono ${isProfitable ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                    {formatPrice(netProfit)}
                </p>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                    {isProfitable ? 'Operating profitably' : 'Operating at a net financial loss'} - {netMargin}% net profit margin
                </p>
            </div>
            {isProfitable ? (
                <TrendingUp className="w-10 h-10 text-emerald-500 opacity-60" />
            ) : (
                <TrendingDown className="w-10 h-10 text-rose-500 opacity-60" />
            )}
        </div>
    );
}
