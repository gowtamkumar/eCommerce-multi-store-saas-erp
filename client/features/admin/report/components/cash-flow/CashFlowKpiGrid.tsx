'use client';

import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';
import type { CashFlowKpiCardConfig, CashFlowKpiGridProps } from '../../types';

const KPI_CARDS: CashFlowKpiCardConfig[] = [
    {
        key: 'totalInflow',
        label: 'Total Cash In (30d)',
        cornerIcon: ArrowUpRight,
        cornerIconClassName: 'text-emerald-600',
        badgeIcon: TrendingUp,
        badgeLabel: 'Sales Revenue',
        badgeClassName: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
        key: 'totalOutflow',
        label: 'Total Cash Out (30d)',
        cornerIcon: ArrowDownRight,
        cornerIconClassName: 'text-rose-600',
        badgeIcon: TrendingDown,
        badgeLabel: 'Expenses & Payouts',
        badgeClassName: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20',
    },
];

const CashFlowKpiGrid: React.FC<CashFlowKpiGridProps> = ({ summary, formatPrice }) => {
    const isPositiveNet = summary.netCashFlow >= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-display">
            {KPI_CARDS.map((card) => {
                const CornerIcon = card.cornerIcon;
                const BadgeIcon = card.badgeIcon;

                return (
                    <div key={card.key} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group transition-all hover:shadow-md">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all">
                            <CornerIcon className={`w-12 h-12 ${card.cornerIconClassName}`} />
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatPrice(summary[card.key])}</h3>
                        <div className={`flex items-center gap-1 mt-2 text-xs font-bold w-fit px-2 py-0.5 rounded-full ${card.badgeClassName}`}>
                            <BadgeIcon className="w-3 h-3" />
                            <span>{card.badgeLabel}</span>
                        </div>
                    </div>
                );
            })}

            <div className={`p-6 rounded-2xl border shadow-lg relative overflow-hidden transition-all hover:shadow-xl ${isPositiveNet ? 'bg-brand-600 border-brand-500' : 'bg-rose-600 border-rose-500'}`}>
                <div className="relative z-10">
                    <p className="text-sm font-medium text-white/70">Net Cash Flow</p>
                    <h3 className="text-2xl font-black text-white mt-1">{formatPrice(summary.netCashFlow)}</h3>
                    <p className="text-xs text-white/60 mt-2 font-medium">
                        {isPositiveNet ? 'Positive liquidity flow' : 'Negative liquidity flow'}
                    </p>
                </div>
                <div className="absolute -bottom-2 -right-2 opacity-10">
                    <div className="w-24 h-24 bg-white rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default React.memo(CashFlowKpiGrid);
