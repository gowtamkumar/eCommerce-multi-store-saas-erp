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
            color: 'text-emerald-600',
        },
        {
            label: 'Gross Profit',
            value: formatPrice(snapshot?.grossProfit || 0),
            hint: `COGS ${formatPrice(snapshot?.cogs || 0)}`,
            color: (snapshot?.grossProfit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600',
        },
        {
            label: 'Operating Expenses',
            value: formatPrice(snapshot?.operatingExpenses || 0),
            hint: 'Period spend',
            color: 'text-amber-600',
        },
        {
            label: 'Net Profit',
            value: formatPrice(snapshot?.netProfit || 0),
            hint: `${(snapshot?.profitMargin || 0).toFixed(1)}% margin`,
            color: (snapshot?.netProfit || 0) >= 0 ? 'text-brand-600' : 'text-rose-600',
        },
    ];

    return (
        <div className="bg-slate-950 dark:bg-slate-950 p-8 rounded-[40px] shadow-2xl border border-slate-800 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%)] pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter italic">
                        <Wallet className="w-6 h-6 text-brand-400" /> Finance Cockpit
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Profitability snapshot for the selected period
                    </p>
                </div>
                <Link href="/admin/finance/profit-loss" className="text-xs font-black text-brand-300 uppercase tracking-widest hover:underline">
                    Open P&L
                </Link>
            </div>
            <div className="relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
                {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-28 rounded-3xl bg-white/5 animate-pulse" />
                    ))
                ) : (
                    items.map((item) => (
                        <div key={item.label} className="p-5 rounded-3xl bg-white/4 border border-white/10">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</div>
                            <div className={`text-2xl font-black font-mono mt-3 ${item.color}`}>{item.value}</div>
                            <div className="text-[11px] font-semibold text-slate-500 mt-2">{item.hint}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
});

FinanceSnapshot.displayName = 'FinanceSnapshot';

export default FinanceSnapshot;
