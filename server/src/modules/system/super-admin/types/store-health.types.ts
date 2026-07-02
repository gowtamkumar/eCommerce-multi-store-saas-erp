export interface StoreHealthAggregate {
  periodDays: number
  generatedAt: string
  stores: {
    total: number
    active: number
    suspended: number
    archived: number
    byPlanTier: Record<string, number>
    bySubscriptionStatus: Record<string, number>
    trialsExpiringWithin7Days: number
    pastDueCount: number
  }
  billing: {
    mrr: number
    totalRevenue: number
    failedPayments: number
    pendingInvoices: number
    atRiskSubscriptionCount: number
  }
  engagement: {
    totalUsers: number
    totalOrders: number
    totalProducts: number
    storesWithZeroOrders: number
    storesWithZeroProducts: number
    lowActivityStoreCount: number
    medianOrdersPerActiveStore: number
  }
  trends: {
    stores?: string | null
    users?: string | null
    orders?: string | null
    traffic?: string | null
  }
  traffic: {
    requestsInPeriod: number
  }
}
