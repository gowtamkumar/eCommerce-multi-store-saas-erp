'use client';

import dayjs from 'dayjs';
import React from 'react';
import { ProfitLossData } from '../types';

interface FinancialStatementProps {
    data?: ProfitLossData | null;
    isLoading: boolean;
    formatPrice: (price: number) => string;
}

export default function FinancialStatement({ data, isLoading, formatPrice }: FinancialStatementProps) {
    if (isLoading && !data) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse h-[500px]" />
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Financial Statement</h3>
                <p className="text-sm text-slate-500">
                    Summary for {dayjs(data?.period?.startDate).format('MMM D')} to {dayjs(data?.period?.endDate).format('MMM D, YYYY')}
                </p>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700/50">
                    <span className="text-slate-600 dark:text-slate-300 font-medium tracking-tight">Sales Revenue</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{formatPrice(data?.revenue?.total || 0)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700/50">
                    <span className="text-slate-600 dark:text-slate-300">Cost of Goods Sold (COGS)</span>
                    <span className="text-orange-600 dark:text-orange-400 font-medium font-mono">({formatPrice(data?.cogs?.total || 0)})</span>
                </div>
                
                <div className="flex justify-between py-3 bg-slate-50 dark:bg-slate-900/50 px-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-900 dark:text-white font-bold">Gross Profit</span>
                    <span className="text-slate-900 dark:text-white font-bold text-lg font-mono">{formatPrice(data?.grossProfit || 0)}</span>
                </div>

                <div className="pt-4 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operating Expenses</span>
                </div>

                {data?.operatingExpenses?.breakdown?.map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 pl-4 group hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                        <span className="text-slate-500 capitalize transition-colors group-hover:text-slate-700 dark:group-hover:text-slate-300">{item.category.toLowerCase()}</span>
                        <span className="text-slate-700 dark:text-slate-300 font-mono">({formatPrice(item.amount)})</span>
                    </div>
                ))}

                <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 pl-4 font-medium italic text-slate-500">
                    <span>Total Operating Expenses</span>
                    <span className="font-mono">({formatPrice(data?.operatingExpenses?.total || 0)})</span>
                </div>

                <div className="mt-8 p-6 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex justify-between items-center border border-brand-100 dark:border-brand-900/30 transition-all hover:shadow-inner">
                    <div>
                        <h4 className="text-brand-900 dark:text-brand-300 font-black text-xl tracking-tight">Net Profit (Loss)</h4>
                        <p className="text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">After all costs and expenses</p>
                    </div>
                    <span className={`text-2xl font-black font-mono ${(data?.netProfit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatPrice(data?.netProfit || 0)}
                    </span>
                </div>
            </div>
        </div>
    );
}
