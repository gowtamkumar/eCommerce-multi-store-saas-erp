'use client';

import { BarChart3, DollarSign, TrendingUp, Truck, Wallet } from 'lucide-react';
import { memo } from 'react';
import type { FinanceKpiCardConfig, FinanceKpiCardProps, FinanceKpiGridProps } from '../../types';

const KPI_CARDS: FinanceKpiCardConfig[] = [
    {
        key: 'totalRevenue',
        label: 'Revenue',
        icon: TrendingUp,
        iconWrapperClassName: 'bg-blue-50 dark:bg-blue-900/30',
        iconClassName: 'text-blue-600',
    },
    {
        key: 'totalExpenses',
        label: 'Expenses',
        icon: Wallet,
        iconWrapperClassName: 'bg-rose-50 dark:bg-rose-900/30',
        iconClassName: 'text-rose-600',
    },
    {
        key: 'netProfit',
        label: 'Net Profit',
        icon: DollarSign,
        iconWrapperClassName: 'bg-emerald-50 dark:bg-emerald-900/30',
        iconClassName: 'text-emerald-600',
    },
    {
        key: 'totalAmountDue',
        label: 'Supplier Debt',
        icon: Truck,
        iconWrapperClassName: 'bg-amber-50 dark:bg-amber-900/30 group-hover:bg-amber-100',
        iconClassName: 'text-amber-600',
        cardClassName: 'transition-all hover:shadow-md hover:border-amber-500/50 group',
        valueClassName: 'font-mono',
    },
    {
        key: 'margin',
        label: 'Margin',
        icon: BarChart3,
        iconWrapperClassName: 'absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500',
        iconClassName: 'text-white',
        cardClassName: 'bg-brand-600 border-brand-500 shadow-lg shadow-brand-500/20 text-white relative overflow-hidden group',
        valueClassName: 'text-3xl',
        formatValue: (value) => `${value.toFixed(1)}%`,
        progressValue: (value) => Math.min(100, value),
    },
];

function FinanceKpiCard({ config, kpis, formatPrice }: FinanceKpiCardProps) {
    const value = kpis?.[config.key] || 0;
    const Icon = config.icon;
    const isMarginCard = config.key === 'margin';
    const baseCardClassName = isMarginCard
        ? 'p-6 rounded-3xl border'
        : 'bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm';

    return (
        <div className={`${baseCardClassName} ${config.cardClassName || ''}`}>
            <div className={isMarginCard ? config.iconWrapperClassName : `${config.iconWrapperClassName} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors`}>
                <Icon className={`${isMarginCard ? 'w-12 h-12' : 'w-6 h-6'} ${config.iconClassName}`} />
            </div>
            <p className={`text-xs font-bold uppercase tracking-widest ${isMarginCard ? 'text-white/70' : 'text-slate-400'}`}>{config.label}</p>
            <h3 className={`${config.valueClassName || 'text-2xl'} font-black mt-1 ${isMarginCard ? '' : 'text-slate-900 dark:text-white'}`}>
                {config.formatValue ? config.formatValue(value, formatPrice) : formatPrice(value)}
            </h3>
            {config.progressValue && (
                <div className="mt-4 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-white h-full transition-all duration-1000 ease-out"
                        style={{ width: `${config.progressValue(value)}%` }}
                    />
                </div>
            )}
        </div>
    );
}

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
            {KPI_CARDS.map((config) => (
                <FinanceKpiCard
                    key={config.key}
                    config={config}
                    kpis={kpis}
                    formatPrice={formatPrice}
                />
            ))}
        </div>
    );
});

FinanceKpiGrid.displayName = 'FinanceKpiGrid';
export default FinanceKpiGrid;
