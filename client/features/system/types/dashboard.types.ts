import type { ReactNode } from 'react';

export interface TrafficData {
  date: string;
  requestCount: number;
}

export interface TenantAnalytics {
  id: string;
  storeName: string;
  subdomain: string;
  planTier: string;
  status: string;
  subscriptionPlan?: { name: string };
  stats: { users: number; products: number; orders: number; pages: number; traffic: number };
}

export type RankedTenantAnalytics = TenantAnalytics & { rank: number };

export interface BillingOverview {
  totalRevenue: number;
  mrr: number;
  arr: number;
  failedCount: number;
  pendingCount: number;
  totalInvoices: number;
}

export interface DashboardTrends {
  tenants?: string | null;
  users?: string | null;
  orders?: string | null;
  traffic?: string | null;
  reviews?: string | null;
}

export interface DashboardStats {
  totalTenants: number;
  totalUsers: number;
  totalOrders: number;
  totalReviews?: number;
  requestsLast24h: number;
  plans: Record<string, number>;
  statuses: Record<string, number>;
  trends?: DashboardTrends;
}

/** Raw `data` payload returned by GET /super-admin/overview. */
export interface RawOverviewData {
  totalTenants?: number;
  totalUsers?: number;
  totalOrders?: number;
  totalReviews?: number;
  totalRequestsLast24h?: number;
  traffic?: TrafficData[];
  trends?: DashboardTrends;
}

export interface SuperAdminDashboardProps {
  stats: DashboardStats;
  traffic: TrafficData[];
  tenantAnalytics: TenantAnalytics[];
}

export type ActionTone = 'rose' | 'amber' | 'indigo' | 'emerald';

export interface ActionItem {
  id: string;
  label: string;
  detail: string;
  count: number;
  href: string;
  tone: ActionTone;
  icon: ReactNode;
}
