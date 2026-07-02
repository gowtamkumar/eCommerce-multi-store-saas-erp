import type { ReactNode } from 'react';

export interface TrafficData {
  date: string;
  requestCount: number;
}

export interface StoreAnalytics {
  id: string;
  storeName: string;
  subdomain: string;
  planTier: string;
  status: string;
  subscriptionPlan?: { name: string };
  stats: { users: number; products: number; orders: number; pages: number; traffic: number };
}

export type RankedStoreAnalytics = StoreAnalytics & { rank: number };

export interface BillingOverview {
  totalRevenue: number;
  mrr: number;
  arr: number;
  failedCount: number;
  pendingCount: number;
  totalInvoices: number;
}

export interface DashboardTrends {
  stores?: string | null;
  users?: string | null;
  orders?: string | null;
  traffic?: string | null;
  reviews?: string | null;
}

export interface DashboardStats {
  totalStores: number;
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
  totalStores?: number;
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
  storeAnalytics: StoreAnalytics[];
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
