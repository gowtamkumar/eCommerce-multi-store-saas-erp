'use client';

const colorMap: Record<string, string> = {
    Current: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    '1-30': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    '31-60': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    '61-90': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    '90+': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 font-black',
};

export interface AgingBadgeProps {
    days: string;
    amount: number;
}

export default function AgingBadge({ days, amount }: AgingBadgeProps) {
    if (amount === 0) return <span className="text-slate-400 text-sm">-</span>;
    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${colorMap[days] || ''}`}>
            ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
    );
}
