'use client';

import { motion } from 'framer-motion';
import {
    ArrowDownRight,
    ArrowUpRight,
    DollarSign,
    Package,
    TrendingDown,
    TrendingUp,
    type LucideIcon,
} from 'lucide-react';
import type { ProfitLossSummary } from '../../types';

function formatPercent(value: number, total: number) {
    if (!total) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
}

interface KpiCard {
    label: string;
    value: string;
    icon: LucideIcon;
    color: string;
    sub: string;
    up: boolean;
}

export interface PLKpiCardsProps {
    plData: ProfitLossSummary | null;
    grossMargin: number;
    netMargin: number;
    isProfitable: boolean;
    formatPrice: (amount: number) => string;
}

export default function PLKpiCards({ plData, grossMargin, netMargin, isProfitable, formatPrice }: PLKpiCardsProps) {
    const revenue = plData?.revenue || 0;
    const cards: KpiCard[] = [
        { label: 'Total Revenue', value: formatPrice(revenue), icon: DollarSign, color: 'blue', sub: 'From Sales Account', up: true },
        { label: 'Cost of Goods Sold', value: formatPrice(plData?.costOfGoodsSold || 0), icon: Package, color: 'amber', sub: `${formatPercent(plData?.costOfGoodsSold || 0, revenue || 1)} of revenue`, up: false },
        { label: 'Gross Profit', value: formatPrice(plData?.grossProfit || 0), icon: TrendingUp, color: 'emerald', sub: `${grossMargin.toFixed(1)}% margin`, up: (plData?.grossProfit || 0) >= 0 },
        { label: 'Net Profit', value: formatPrice(plData?.netProfit || 0), icon: isProfitable ? TrendingUp : TrendingDown, color: isProfitable ? 'violet' : 'rose', sub: `${netMargin.toFixed(1)}% net margin`, up: isProfitable },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <motion.div
                        key={card.label}
                        whileHover={{ y: -3 }}
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-${card.color}-50 dark:bg-${card.color}-900/20`}>
                                <Icon className={`w-5 h-5 text-${card.color}-600`} />
                            </div>
                            {card.up ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-rose-500" />}
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">{card.value}</p>
                        <p className="text-xs text-slate-400">{card.sub}</p>
                    </motion.div>
                );
            })}
        </div>
    );
}
