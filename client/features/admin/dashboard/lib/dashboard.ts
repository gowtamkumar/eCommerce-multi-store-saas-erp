import type { ActionTone, DashboardPeriod, DashboardStats, HealthItem } from '../types';

export const ORDER_STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-600',
    confirmed: 'bg-blue-100 text-blue-600',
    shipped: 'bg-indigo-100 text-indigo-600',
    completed: 'bg-emerald-100 text-emerald-600',
    cancelled: 'bg-rose-100 text-rose-600',
};

export const ACTION_TONES: Record<ActionTone, string> = {
    rose: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/15 dark:text-rose-400 dark:border-rose-900/30',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/15 dark:text-amber-400 dark:border-amber-900/30',
    blue: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/15 dark:text-blue-400 dark:border-blue-900/30',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/15 dark:text-emerald-400 dark:border-emerald-900/30',
    slate: 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700',
};

export function getPeriodLabel(period: DashboardPeriod): string {
    return period.charAt(0).toUpperCase() + period.slice(1);
}

export function getSalesChartSubtitle(period: DashboardPeriod): string {
    if (period === 'day') return 'Hourly flow · today';
    if (period === 'week') return 'Daily flow · last 7 days';
    return 'Daily flow · last 30 days';
}

export function buildHealthItems(stats: DashboardStats | null): HealthItem[] {
    if (!stats) return [];

    const items = [
        { label: 'Users', val: stats.counts?.users || 0, color: 'bg-indigo-500' },
        { label: 'Products', val: stats.counts?.products || 0, color: 'bg-emerald-500' },
        { label: 'Orders', val: stats.counts?.orders || 0, color: 'bg-amber-500' },
        { label: 'Pages', val: stats.counts?.pages || 0, color: 'bg-blue-500' },
    ];
    const max = Math.max(...items.map((i) => i.val), 1);
    return items.map((i) => ({ ...i, pct: Math.round((i.val / max) * 100) }));
}
