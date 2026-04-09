'use client';

import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import { memo } from 'react';
import type { ProfitLossKpiGridProps } from '../../types';



const ProfitLossKpiGrid = memo(({ data, isLoading, formatPrice }: ProfitLossKpiGridProps) => {
    if (isLoading && !data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 h-32 rounded-2xl border border-slate-200 dark:border-slate-700 animate-pulse shadow-sm" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+Revenue</span>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                    {formatPrice(data?.revenue?.total || 0)}
                </h3>
                <p className="text-xs text-slate-400 mt-2">{data?.revenue?.orderCount || 0} Orders processed</p>
            </div>

            {/* COGS */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                        <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">-COGS</span>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cost of Goods Sold</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                    {formatPrice(data?.cogs?.total || 0)}
                </h3>
                <p className="text-xs text-slate-400 mt-2">{data?.cogs?.purchaseOrderCount || 0} Purchase orders</p>
            </div>

            {/* Operating Expenses */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
                        <ArrowDownRight className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">-Expenses</span>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Operating Expenses</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                    {formatPrice(data?.operatingExpenses?.total || 0)}
                </h3>
                <p className="text-xs text-slate-400 mt-2">Staff, utilities & others</p>
            </div>

            {/* Net Profit */}
            <div className="bg-brand-600 p-6 rounded-2xl shadow-lg shadow-brand-500/20 text-white relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                        <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                        {data?.profitMargin?.toFixed(1) || '0.0'}% Margin
                    </span>
                </div>
                <div className="relative z-10">
                    <p className="text-sm font-medium text-white/80">Net Profit</p>
                    <h3 className="text-2xl font-bold mt-1 font-mono">
                        {formatPrice(data?.netProfit || 0)}
                    </h3>
                    <p className="text-xs text-white/60 mt-2">Final bottom line</p>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </div>
        </div>
    );
});

ProfitLossKpiGrid.displayName = 'ProfitLossKpiGrid';
export default ProfitLossKpiGrid;
