'use client';

import { Wallet } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import type { DashboardStats } from '../../types';

const FinanceSnapshot = memo(({
    snapshot,
    loading,
    formatPrice,
}: {
    snapshot?: DashboardStats['financeSnapshot'];
    loading: boolean;
    formatPrice: (value: number) => string;
}) => {
    const items = [
        {
            label: 'Revenue',
            value: formatPrice(snapshot?.revenue || 0),
            hint: 'Selected period',
            color: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            label: 'Gross Profit',
            value: formatPrice(snapshot?.grossProfit || 0),
            hint: `COGS ${formatPrice(snapshot?.cogs || 0)}`,
            color: (snapshot?.grossProfit || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
        },
        {
            label: 'Operating Expenses',
            value: formatPrice(snapshot?.operatingExpenses || 0),
            hint: 'Period spend',
            color: 'text-amber-600 dark:text-amber-400',
        },
        {
            label: 'Net Profit',
            value: formatPrice(snapshot?.netProfit || 0),
            hint: `${(snapshot?.profitMargin || 0).toFixed(1)}% margin`,
            color: (snapshot?.netProfit || 0) >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-rose-600 dark:text-rose-400',
        },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_35%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%)] pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter italic">
                        <Wallet className="w-6 h-6 text-brand-600 dark:text-brand-400" /> Finance Cockpit
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Profitability snapshot for the selected period
                    </p>
                </div>
                <Link href="/admin/finance/profit-loss" className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest hover:underline">
                    Open P&L
                </Link>
            </div>
            <div className="relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
                {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-28 rounded-3xl bg-slate-50 dark:bg-slate-900/30 animate-pulse" />
                    ))
                ) : (
                    items.map((item) => (
                        <div key={item.label} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{item.label}</div>
                            <div className={`text-2xl font-black font-mono mt-3 ${item.color}`}>{item.value}</div>
                            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2">{item.hint}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
});

FinanceSnapshot.displayName = 'FinanceSnapshot';

export default FinanceSnapshot;
