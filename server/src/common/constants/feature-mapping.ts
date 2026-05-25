export const FEATURE_TO_ROUTES_MAPPING: Record<string, string[]> = {
  pos: ['/admin/pos', '/admin/pos-registers'],
  finance: [
    '/admin/finance',
    '/admin/finance/profit-loss',
    '/admin/finance/balance-sheet',
    '/admin/finance/ledger',
    '/admin/finance/ar',
    '/admin/finance/ap',
    '/admin/finance/wallet',
    '/admin/finance/accounts',
    '/admin/finance/cash-flow',
    '/admin/finance/fiscal-periods',
    '/admin/finance/tax',
    '/admin/expenses',
  ],
  hrm: [
    '/admin/hrm',
    '/admin/hrm/dashboard',
    '/admin/hrm/employees',
    '/admin/hrm/departments',
    '/admin/hrm/designations',
    '/admin/hrm/attendance',
    '/admin/hrm/leaves',
    '/admin/hrm/shifts',
    '/admin/hrm/payroll',
    '/admin/hrm/recruitment',
    '/admin/hrm/performance',
  ],
  orders: [
    '/admin/orders',
    '/admin/carts',
    '/admin/returns',
    '/admin/payments',
    '/admin/invoices',
    '/admin/customers',
  ],
  catalog: [
    '/admin/products',
    '/admin/categories',
    '/admin/brands',
    '/admin/price-books',
    '/admin/media',
    '/admin/reviews',
  ],
  inventory: [
    '/admin/inventory',
    '/admin/warehouses',
    '/admin/stock-transfers',
    '/admin/batches',
    '/admin/cycle-count',
  ],
  purchasing: [
    '/admin/purchases',
    '/admin/suppliers',
    '/admin/grn',
    '/admin/procurement/dashboard',
    '/admin/procurement/suppliers',
    '/admin/procurement/requisitions',
    '/admin/procurement/rfqs',
    '/admin/procurement/purchases',
    '/admin/procurement/grn',
    '/admin/procurement/invoices',
    '/admin/procurement/debit-notes',
  ],
  marketing: [
    '/admin/campaigns',
    '/admin/coupons',
    '/admin/promotions',
    '/admin/subscribers',
    '/admin/leads',
    '/admin/reports/marketing',
    '/admin/marketing/loyalty',
  ],
  settings: ['/admin/settings', '/admin/team', '/admin/roles', '/admin/audit-logs'],
  custom_domain: ['/admin/settings/domain'],
  currencies: ['/admin/settings/currencies'],
  social_links: ['/admin/settings/social'],
  trust_safety: ['/admin/settings/trust'],
  seo: ['/admin/settings/marketing'],
  label_config: ['/admin/settings/label'],
  organization: ['/admin/settings/organization'],
  email: ['/admin/settings/email'],
  sms: ['/admin/settings/sms'],
  payment_settings: ['/admin/settings/payment'],
  courier: ['/admin/settings/courier'],
  header: ['/admin/settings/navbar'],
  footer: ['/admin/settings/footer'],
  product_list_ui: ['/admin/settings/productsPage'],
  product_detail_ui: ['/admin/settings/singleProductPage'],
  offers_page_ui: ['/admin/settings/offersPage'],
  reports: [
    '/admin/reports',
    '/admin/reports/sales',
    '/admin/reports/warehouse-stock',
    '/admin/reports/finance',
    '/admin/reports/profit-loss',
    '/admin/reports/supplier-ledger',
    '/admin/reports/customer-ledger',
    '/admin/reports/cash-flow',
    '/admin/reports/export',
  ],
  logistics: ['/admin/logistics', '/admin/fulfillment', '/admin/couriers'],
  content: ['/admin/pages', '/admin/faqs'],
  branding: [],

  // ─────────────────────────────────────────────────────────────────
  // Legacy Marketing Aliases (for backward compatibility)
  // ─────────────────────────────────────────────────────────────────
  staff_accounts: ['/admin/hrm'],
  unlimited_products: ['/admin/products'],
  advanced_analytics: [
    '/admin/reports',
    '/admin/reports/sales',
    '/admin/reports/profit-loss',
    '/admin/reports/supplier-ledger',
    '/admin/reports/customer-ledger',
    '/admin/reports/cash-flow',
    '/admin/reports/export',
    '/admin/reports/finance',
  ],
  remove_branding: ['remove_branding'],
  navbar: ['/admin/settings/navbar'],
}

// Build reverse mapping: route path -> abstract feature key
export const ROUTE_TO_FEATURE_MAPPING: Record<string, string> = {}
for (const [featureKey, routes] of Object.entries(FEATURE_TO_ROUTES_MAPPING)) {
  for (const route of routes) {
    ROUTE_TO_FEATURE_MAPPING[route] = featureKey
  }
}

/**
 * Normalizes an array of features (could be route paths or abstract keys)
 * into a unique list of abstract feature keys.
 */
export function normalizeFeatures(features: string[]): string[] {
  if (!features || !Array.isArray(features)) return []
  const normalized = new Set<string>()
  for (const feat of features) {
    if (FEATURE_TO_ROUTES_MAPPING[feat]) {
      // It's already a valid abstract feature key
      normalized.add(feat)
    } else {
      // Check if it's a route that maps to a feature key
      const mappedFeature = ROUTE_TO_FEATURE_MAPPING[feat]
      if (mappedFeature) {
        normalized.add(mappedFeature)
      } else {
        // Fallback for custom or unmapped items
        normalized.add(feat)
      }
    }
  }
  return Array.from(normalized)
}

/**
 * Expands a list of abstract feature keys into the list of all corresponding route paths.
 * Adds the original abstract feature keys as well.
 */
export function expandFeatures(features: string[]): string[] {
  if (!features || !Array.isArray(features)) return []
  const expanded = new Set<string>()
  for (const feat of features) {
    expanded.add(feat)
    const routes = FEATURE_TO_ROUTES_MAPPING[feat]
    if (routes) {
      for (const route of routes) {
        expanded.add(route)
      }
    }
  }
  return Array.from(expanded)
}
