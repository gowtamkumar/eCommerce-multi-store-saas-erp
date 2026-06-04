'use client';

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { memo } from 'react';

const TrendBadge = memo(({ value }: { value: number | null | undefined }) => {
    if (value === null || value === undefined) return null;
    const positive = value >= 0;
    const Icon = positive ? ArrowUpRight : ArrowDownRight;

    return (
        <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-black ${positive
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                }`}
        >
            <Icon className="w-3 h-3" />
            {Math.abs(value).toFixed(1)}%
        </span>
    );
});

TrendBadge.displayName = 'TrendBadge';

export default TrendBadge;
