'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchSuperAdminAPI, downloadSuperAdminFile } from '@/services/supperAdminApi';
import { buildDashboardStats } from '../lib/dashboard';
import type {
  BillingOverview,
  DashboardStats,
  TenantAnalytics,
  TrafficData,
} from '../types/dashboard.types';

interface UseSuperAdminDashboardArgs {
  initialStats: DashboardStats;
  initialTraffic: TrafficData[];
  initialAnalytics: TenantAnalytics[];
}

const AUTO_REFRESH_MS = 60_000;

/**
 * Owns all data concerns for the Super Admin dashboard: fetching, reshaping,
 * auto-refresh, a latest-wins race guard, and CSV export. Presentational
 * components stay pure and just consume the returned view state.
 */
export function useSuperAdminDashboard({
  initialStats,
  initialTraffic,
  initialAnalytics,
}: UseSuperAdminDashboardArgs) {
  const [days, setDays] = useState(7);
  const [stats, setStats] = useState(initialStats);
  const [traffic, setTraffic] = useState(initialTraffic);
  const [analytics, setAnalytics] = useState<TenantAnalytics[]>(initialAnalytics);
  const [billing, setBilling] = useState<BillingOverview | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(() => new Date());
  const requestIdRef = useRef(0);

  const refresh = useCallback(async (selectedDays: number, silent = false) => {
    if (!silent) setIsRefreshing(true);
    const requestId = ++requestIdRef.current;
    try {
      const [overview, analyticsRes, billingRes] = await Promise.all([
        fetchSuperAdminAPI(`/super-admin/overview?days=${selectedDays}`),
        fetchSuperAdminAPI('/super-admin/tenants/analytics'),
        fetchSuperAdminAPI('/super-admin/billing/overview').catch(() => null),
      ]);

      // Latest-wins guard: ignore stale responses from earlier/auto refreshes.
      if (requestId !== requestIdRef.current) return;

      const tenants: TenantAnalytics[] = analyticsRes.data || [];
      setStats(buildDashboardStats(overview.data, tenants));
      setTraffic(overview.data?.traffic || []);
      setAnalytics(tenants);
      if (billingRes?.success) setBilling(billingRes.data);
      setLastRefreshed(new Date());
    } catch {
      if (!silent) toast.error('Failed to refresh dashboard');
    } finally {
      if (!silent && requestId === requestIdRef.current) setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh on an interval (silent — no spinner / error toast).
  useEffect(() => {
    const interval = setInterval(() => refresh(days, true), AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [days, refresh]);

  // Refresh when the selected window changes. Deferred so the state update
  // doesn't run synchronously inside the effect body (avoids cascading renders).
  useEffect(() => {
    const id = setTimeout(() => refresh(days), 0);
    return () => clearTimeout(id);
  }, [days, refresh]);

  const exportCsv = useCallback(async () => {
    setIsExporting(true);
    try {
      await downloadSuperAdminFile('/super-admin/analytics/export', `analytics-${Date.now()}.csv`);
      toast.success('Analytics CSV downloaded');
    } catch {
      toast.error('Failed to export analytics');
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    days,
    setDays,
    stats,
    traffic,
    analytics,
    billing,
    isRefreshing,
    isExporting,
    lastRefreshed,
    refresh,
    exportCsv,
  };
}
