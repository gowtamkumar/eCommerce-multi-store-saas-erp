'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';
import { CashFlowSummary } from '../types';

interface CashFlowKpiGridProps {
    summary: CashFlowSummary;
    formatPrice: (price: number) => string;
}

const CashFlowKpiGrid: React.FC<CashFlowKpiGridProps> = ({ summary, formatPrice }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-display">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all">
                    <ArrowUpRight className="w-12 h-12 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Cash In (30d)</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatPrice(summary.totalInflow)}</h3>
                <div className="flex items-center gap-1 mt-2 text-emerald-600 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 w-fit px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span>Sales Revenue</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all">
                    <ArrowDownRight className="w-12 h-12 text-rose-600" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Cash Out (30d)</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatPrice(summary.totalOutflow)}</h3>
                <div className="flex items-center gap-1 mt-2 text-rose-600 text-xs font-bold bg-rose-50 dark:bg-rose-900/20 w-fit px-2 py-0.5 rounded-full">
                    <TrendingDown className="w-3 h-3" />
                    <span>Expenses & Payouts</span>
                </div>
            </div>

            <div className={`p-6 rounded-2xl border shadow-lg relative overflow-hidden transition-all hover:shadow-xl ${summary.netCashFlow >= 0 ? 'bg-brand-600 border-brand-500' : 'bg-rose-600 border-rose-500'}`}>
                <div className="relative z-10">
                    <p className="text-sm font-medium text-white/70">Net Cash Flow</p>
                    <h3 className="text-2xl font-black text-white mt-1">{formatPrice(summary.netCashFlow)}</h3>
                    <p className="text-xs text-white/60 mt-2 font-medium">
                        {summary.netCashFlow >= 0 ? 'Positive liquidity flow' : 'Negative liquidity flow'}
                    </p>
                </div>
                <div className="absolute -bottom-2 -right-2 opacity-10">
                   <div className="w-24 h-24 bg-white rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(CashFlowKpiGrid);
