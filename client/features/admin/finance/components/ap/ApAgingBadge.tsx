'use client';

import { useSettings } from '@/hooks/SettingsContext';

const colorMap: Record<string, string> = {
    Current: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
    '1-30': 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400',
    '31-60': 'bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400',
    '61-90': 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400',
    '90+': 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 font-black',
};

export interface ApAgingBadgeProps {
    days: string;
    amount: number;
}

export default function ApAgingBadge({ days, amount }: ApAgingBadgeProps) {
    const { formatPrice } = useSettings();
    if (amount === 0) return <span className="text-slate-400 dark:text-slate-600 text-sm">-</span>;
    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${colorMap[days] || ''}`}>
            {formatPrice(amount)}
        </span>
    );
}
