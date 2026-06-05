'use client';

import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import { memo } from 'react';
import type { ProfitLossKpiCardConfig, ProfitLossKpiCardProps, ProfitLossKpiGridProps } from '../../types';

const KPI_CARDS: ProfitLossKpiCardConfig[] = [
    {
        key: 'revenue',
        label: 'Total Revenue',
        icon: TrendingUp,
        iconWrapperClassName: 'bg-emerald-50 dark:bg-emerald-900/30',
        iconClassName: 'text-emerald-600 dark:text-emerald-400',
        badgeLabel: () => '+Revenue',
        badgeClassName: 'text-emerald-600 bg-emerald-50',
        getValue: (data) => data?.revenue?.total || 0,
        subtitle: (data) => `${data?.revenue?.orderCount || 0} Orders processed`,
    },
    {
        key: 'cogs',
        label: 'Cost of Goods Sold',
        icon: TrendingDown,
        iconWrapperClassName: 'bg-orange-50 dark:bg-orange-900/30',
        iconClassName: 'text-orange-600 dark:text-orange-400',
        badgeLabel: () => '-COGS',
        badgeClassName: 'text-orange-600 bg-orange-50',
        getValue: (data) => data?.cogs?.total || 0,
        subtitle: (data) => `${data?.cogs?.purchaseOrderCount || 0} Purchase orders`,
    },
    {
        key: 'operatingExpenses',
        label: 'Operating Expenses',
        icon: ArrowDownRight,
        iconWrapperClassName: 'bg-rose-50 dark:bg-rose-900/30',
        iconClassName: 'text-rose-600 dark:text-rose-400',
        badgeLabel: () => '-Expenses',
        badgeClassName: 'text-rose-600 bg-rose-50',
        getValue: (data) => data?.operatingExpenses?.total || 0,
        subtitle: () => 'Staff, utilities & others',
    },
    {
        key: 'netProfit',
        label: 'Net Profit',
        icon: ArrowUpRight,
        iconWrapperClassName: 'bg-white/20 group-hover:bg-white/30',
        iconClassName: 'text-white',
        badgeLabel: (data) => `${data?.profitMargin?.toFixed(1) || '0.0'}% Margin`,
        badgeClassName: 'bg-white/20',
        getValue: (data) => data?.netProfit || 0,
        subtitle: () => 'Final bottom line',
        variant: 'highlight',
    },
];

function ProfitLossKpiCard({ config, data, formatPrice }: ProfitLossKpiCardProps) {
    const Icon = config.icon;
    const isHighlight = config.variant === 'highlight';

    if (isHighlight) {
        return (
            <div className="bg-brand-600 p-6 rounded-2xl shadow-lg shadow-brand-500/20 text-white relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`p-2 ${config.iconWrapperClassName} rounded-lg transition-colors`}>
                        <Icon className={`w-5 h-5 ${config.iconClassName}`} />
                    </div>
                    <span className={`text-xs font-semibold ${config.badgeClassName} px-2 py-0.5 rounded-full`}>
                        {config.badgeLabel(data)}
                    </span>
                </div>
                <div className="relative z-10">
                    <p className="text-sm font-medium text-white/80">{config.label}</p>
                    <h3 className="text-2xl font-bold mt-1 font-mono">{formatPrice(config.getValue(data))}</h3>
                    <p className="text-xs text-white/60 mt-2">{config.subtitle(data)}</p>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 ${config.iconWrapperClassName} rounded-lg`}>
                    <Icon className={`w-5 h-5 ${config.iconClassName}`} />
                </div>
                <span className={`text-xs font-semibold ${config.badgeClassName} px-2 py-0.5 rounded-full`}>
                    {config.badgeLabel(data)}
                </span>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{config.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                {formatPrice(config.getValue(data))}
            </h3>
            <p className="text-xs text-slate-400 mt-2">{config.subtitle(data)}</p>
        </div>
    );
}

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
            {KPI_CARDS.map((config) => (
                <ProfitLossKpiCard
                    key={config.key}
                    config={config}
                    data={data}
                    formatPrice={formatPrice}
                />
            ))}
        </div>
    );
});

ProfitLossKpiGrid.displayName = 'ProfitLossKpiGrid';
export default ProfitLossKpiGrid;
