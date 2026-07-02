import type {
  ActionTone,
  DashboardStats,
  RawOverviewData,
  StoreAnalytics,
} from '../types/dashboard.types';

/** Plan name (lowercased) → progress-bar / badge color. */
export const PLAN_COLOR_MAP: Record<string, string> = {
  enterprise: 'bg-purple-500',
  'pro seller': 'bg-blue-500',
  starter: 'bg-slate-400',
  basic: 'bg-slate-400',
};

export const planColor = (name?: string): string =>
  PLAN_COLOR_MAP[(name || 'basic').toLowerCase()] || 'bg-slate-400';

/** Single source of truth for status-filtered store deep links. */
export const storeStatusHref = (status: string): string =>
  `/system/stores?status=${status}`;

/** Tailwind classes for each Action Center severity tone. */
export const ACTION_TONES: Record<ActionTone, string> = {
  rose: 'border-rose-100 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400',
  amber: 'border-amber-100 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
  indigo: 'border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400',
  emerald: 'border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
};

export function buildPlanCounts(stores: StoreAnalytics[]): Record<string, number> {
  return stores.reduce<Record<string, number>>((acc, t) => {
    const plan = t.subscriptionPlan?.name?.toLowerCase() || 'basic';
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {});
}

export function buildStatusCounts(stores: StoreAnalytics[]): Record<string, number> {
  return stores.reduce<Record<string, number>>((acc, t) => {
    const status = t.status?.toLowerCase() || 'active';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Reshapes the raw `/super-admin/overview` payload + store analytics into the
 * `DashboardStats` view model. Shared by the server page (initial render) and
 * the client refresh hook so the two never drift out of sync.
 */
export function buildDashboardStats(
  overview: RawOverviewData | undefined,
  stores: StoreAnalytics[],
): DashboardStats {
  return {
    totalStores: overview?.totalStores || 0,
    totalUsers: overview?.totalUsers || 0,
    totalOrders: overview?.totalOrders || 0,
    totalReviews: overview?.totalReviews || 0,
    requestsLast24h: overview?.totalRequestsLast24h || 0,
    plans: buildPlanCounts(stores),
    statuses: buildStatusCounts(stores),
    trends: overview?.trends,
  };
}
