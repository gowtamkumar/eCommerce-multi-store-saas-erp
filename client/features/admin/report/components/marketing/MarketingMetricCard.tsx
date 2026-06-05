'use client';

import { memo } from 'react';
import type { DashboardIcon } from '@/features/admin/dashboard/types';

export interface MarketingMetricCardProps {
    title: string;
    value: string | number;
    subtext?: string;
    icon: DashboardIcon;
    colorClass: string;
    borderClass?: string;
}

const MarketingMetricCard = memo(({
    title,
    value,
    subtext,
    icon: Icon,
    colorClass,
    borderClass,
}: MarketingMetricCardProps) => (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-3xl border ${borderClass || 'border-slate-100 dark:border-slate-800'} shadow-sm transition-all hover:shadow-md group`}>
        <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</p>
            <div className={`p-2.5 ${colorClass} rounded-xl transition-transform group-hover:scale-110`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        <p className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1 font-semibold">{subtext}</p>}
    </div>
));

MarketingMetricCard.displayName = 'MarketingMetricCard';

export default MarketingMetricCard;
