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
import type { PLData } from '../../types';

interface KpiCard {
    label: string;
    value: string;
    icon: LucideIcon;
    color: string;
    up: boolean;
    sub: string;
}

export interface ProfitLossKpiCardsProps {
    data: PLData | null;
    grossMargin: string;
    netMargin: string;
    isProfitable: boolean;
    formatPrice: (amount: number) => string;
}

export default function ProfitLossKpiCards({
    data,
    grossMargin,
    netMargin,
    isProfitable,
    formatPrice,
}: ProfitLossKpiCardsProps) {
    const revenue = data?.revenue || 0;
    const cogs = data?.costOfGoodsSold || 0;
    const costRatio = ((cogs / (revenue || 1)) * 100).toFixed(1);

    const cards: KpiCard[] = [
        { label: 'Gross Revenues', value: formatPrice(revenue), icon: DollarSign, color: 'indigo', up: true, sub: 'Total transactional sales' },
        { label: 'Cost of Sales (COGS)', value: formatPrice(cogs), icon: Package, color: 'amber', up: false, sub: `${costRatio}% sales cost ratio` },
        { label: 'Gross Profit', value: formatPrice(data?.grossProfit || 0), icon: TrendingUp, color: 'emerald', up: (data?.grossProfit || 0) >= 0, sub: `${grossMargin}% gross margin` },
        { label: 'Net Earnings', value: formatPrice(data?.netProfit || 0), icon: isProfitable ? TrendingUp : TrendingDown, color: isProfitable ? 'violet' : 'rose', up: isProfitable, sub: `${netMargin}% bottom-line margin` },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card, i) => {
                const Icon = card.icon;
                return (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-${card.color}-50 dark:bg-${card.color}-950/20`}>
                                <Icon className={`w-5 h-5 text-${card.color}-600 dark:text-${card.color}-400`} />
                            </div>
                            {card.up ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-rose-500" />}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mb-1 font-mono">{card.value}</p>
                        <p className="text-xs text-slate-400 font-semibold">{card.sub}</p>
                    </motion.div>
                );
            })}
        </div>
    );
}
