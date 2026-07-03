/** Mirror of server `feature-mapping.ts` — permission prefix → plan feature slug. */
export const PERMISSION_FEATURE_TO_PLAN_FEATURE: Record<string, string> = {
  accounting: 'finance',
  invoices: 'orders',
  payments: 'orders',
  crm: 'orders',
  supplier: 'purchasing',
  returns: 'orders',
  coupons: 'marketing',
  promotions: 'marketing',
  fulfillment: 'logistics',
  shipping: 'logistics',
}

export function getPlanFeature(featureSlug: string): string {
  return PERMISSION_FEATURE_TO_PLAN_FEATURE[featureSlug] || featureSlug
}

/** Plan feature slug(s) for a permission code (e.g. `hrm:manage-employees` → `hrm`). */
export function getFeaturesForPermission(permission: string): string[] {
  const prefix = permission.split(':')[0]
  const plan = getPlanFeature(prefix)
  return prefix === plan ? [prefix] : [prefix, plan]
}
