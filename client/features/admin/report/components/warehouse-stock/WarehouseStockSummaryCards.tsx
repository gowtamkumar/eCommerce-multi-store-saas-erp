'use client';

import { AlertTriangle, Package, Wallet, XCircle } from 'lucide-react';
import { memo } from 'react';
import type { WarehouseStockSummaryCardProps, WarehouseStockSummaryCardsProps } from '../../types';

const SummaryCard = memo(({ title, value, icon: Icon, colorClass, borderClass }: WarehouseStockSummaryCardProps) => (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border ${borderClass || 'border-slate-100 dark:border-slate-700'} shadow-sm transition-all hover:shadow-md group`}>
        <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 ${colorClass} rounded-xl transition-transform group-hover:scale-110`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
        </div>
        <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{value}</p>
    </div>
));
SummaryCard.displayName = 'SummaryCard';

export default function WarehouseStockSummaryCards({ stats, formatPrice, currencyCode }: WarehouseStockSummaryCardsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
                title="Tracked Items"
                value={stats.totalProducts}
                icon={Package}
                colorClass="bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
            />
            <SummaryCard
                title={currencyCode ? `Asset Valuation (${currencyCode})` : 'Asset Valuation'}
                value={formatPrice(stats.totalValue)}
                icon={Wallet}
                colorClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
            />
            <SummaryCard
                title="Low Stock Warning"
                value={stats.lowStockCount}
                icon={AlertTriangle}
                colorClass="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                borderClass="border-orange-100 dark:border-orange-900/30"
            />
            <SummaryCard
                title="Critical Stock"
                value={stats.outOfStockCount}
                icon={XCircle}
                colorClass="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                borderClass="border-red-100 dark:border-red-900/30"
            />
        </div>
    );
}
