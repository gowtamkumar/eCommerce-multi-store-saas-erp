'use client';

import { memo } from 'react';
import type { DashboardIcon } from '../../types';
import TrendBadge from './TrendBadge';

type StatCardProps = {
    label: string;
    value: number;
    subValue: string;
    icon: DashboardIcon;
    colorClass?: string;
    bgClass: string;
    loading: boolean;
    isPrice?: boolean;
    formatPrice?: (value: number) => string;
    trend?: number | null;
};

const StatCard = memo(({
    label,
    value,
    subValue,
    icon: Icon,
    colorClass,
    bgClass,
    loading,
    isPrice = false,
    formatPrice = (nextValue) => String(nextValue),
    trend,
}: StatCardProps) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 group">
        <div className="flex items-center justify-between mb-4">
            <div>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                    {label}
                </p>
                {loading ? (
                    <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
                ) : (
                    <div className="flex items-center gap-2">
                        <h3 className={`text-2xl font-black ${colorClass || 'text-slate-900 dark:text-white'} font-mono`}>
                            {isPrice ? formatPrice(value) : value}
                        </h3>
                        <TrendBadge value={trend} />
                    </div>
                )}
            </div>
            <div className={`p-3 ${bgClass} rounded-2xl group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${colorClass}`} />
            </div>
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
            {subValue}
        </div>
    </div>
));

StatCard.displayName = 'StatCard';

export default StatCard;
