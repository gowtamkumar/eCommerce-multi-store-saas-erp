'use client';

import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import React from 'react';
import { LedgerSummary } from '../../types';

interface CustomerLedgerSummaryProps {
    summary: LedgerSummary;
    formatPrice: (price: number) => string;
}

const CustomerLedgerSummary: React.FC<CustomerLedgerSummaryProps> = ({ summary, formatPrice }) => {
    const hasBalance = summary.balance > 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-display">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Obligation</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatPrice(summary.totalOrders)}</h3>
                <div className="flex items-center gap-2 mt-2 text-xs text-brand-600 font-bold bg-brand-50 dark:bg-brand-900/20 w-fit px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>Total Orders</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Settlement</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatPrice(summary.totalPaid)}</h3>
                <div className="flex items-center gap-2 mt-2 text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20 w-fit px-2 py-0.5 rounded-full">
                    <ArrowDownLeft className="w-3 h-3" />
                    <span>Total Paid</span>
                </div>
            </div>

            <div className={`p-6 rounded-2xl border shadow-lg transition-all hover:shadow-xl ${hasBalance ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-900/30' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30'}`}>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Balance</p>
                <h3 className={`text-2xl font-black mt-1 ${hasBalance ? 'text-rose-700 dark:text-rose-500' : 'text-emerald-700 dark:text-emerald-500'}`}>
                    {formatPrice(summary.balance)}
                </h3>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                    {hasBalance ? 'Outstanding dues from customer' : 'All accounts settled'}
                </p>
            </div>
        </div>
    );
};

export default React.memo(CustomerLedgerSummary);
