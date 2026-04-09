'use client';

import { BarChart3, DollarSign, TrendingUp, Truck, Wallet } from 'lucide-react';
import { memo } from 'react';
import type { FinanceKpiGridProps } from '../../types';



const FinanceKpiGrid = memo(({ kpis, isLoading, formatPrice }: FinanceKpiGridProps) => {
    if (isLoading && !kpis) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse h-32" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Revenue</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatPrice(kpis?.totalRevenue || 0)}</h3>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mb-4">
                    <Wallet className="w-6 h-6 text-rose-600" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expenses</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatPrice(kpis?.totalExpenses || 0)}</h3>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Net Profit</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatPrice(kpis?.netProfit || 0)}</h3>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md hover:border-amber-500/50 group">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                        <Truck className="w-6 h-6 text-amber-600" />
                    </div>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Supplier Debt</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">{formatPrice(kpis?.totalAmountDue || 0)}</h3>
            </div>

            <div className="bg-brand-600 p-6 rounded-3xl border border-brand-500 shadow-lg shadow-brand-500/20 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                    <BarChart3 className="w-12 h-12" />
                </div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Margin</p>
                <h3 className="text-3xl font-black mt-1">{kpis?.margin?.toFixed(1)}%</h3>
                <div className="mt-4 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-white h-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(100, kpis?.margin || 0)}%` }}
                    />
                </div>
            </div>
        </div>
    );
});

FinanceKpiGrid.displayName = 'FinanceKpiGrid';
export default FinanceKpiGrid;
