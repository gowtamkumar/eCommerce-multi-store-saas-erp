export interface TenantHealthAggregate {
  periodDays: number
  generatedAt: string
  tenants: {
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
    tenantsWithZeroOrders: number
    tenantsWithZeroProducts: number
    lowActivityTenantCount: number
    medianOrdersPerActiveTenant: number
  }
  trends: {
    tenants?: string | null
    users?: string | null
    orders?: string | null
    traffic?: string | null
  }
  traffic: {
    requestsInPeriod: number
  }
}
