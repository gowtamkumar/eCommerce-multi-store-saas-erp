'use client';

import { BarChart3 } from 'lucide-react';
import { memo } from 'react';
import type { ExpenseDistributionProps } from '../../types';



const ExpenseDistribution = memo(({ data, isLoading }: ExpenseDistributionProps) => {
    if (isLoading && !data) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse h-[400px]" />
        );
    }

    const total = data?.total || 1;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-6 flex flex-col h-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Expense Distribution</h3>

            <div className="flex-1 space-y-6">
                {data?.breakdown?.slice(0, 10).map((item, i) => {
                    const percentage = (item.amount / total) * 100;
                    return (
                        <div key={i} className="group">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-black text-slate-700 dark:text-slate-300 capitalize tracking-tight group-hover:text-brand-600 transition-colors">
                                    {item.category.toLowerCase()}
                                </span>
                                <span className="text-slate-500 font-mono text-xs">{percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="bg-brand-500 h-full rounded-full transition-all duration-1000 ease-out group-hover:bg-brand-400 group-hover:brightness-110"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}

                {(!data?.breakdown || data.breakdown.length === 0) && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center">
                            <BarChart3 className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-sm font-medium">No expenses recorded for this period</p>
                    </div>
                )}
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">
                <p><strong>Note:</strong> COGS includes all purchase orders. Operating expenses include all manual entries recorded in the Expenses module.</p>
            </div>
        </div>
    );
});

ExpenseDistribution.displayName = 'ExpenseDistribution';
export default ExpenseDistribution;
