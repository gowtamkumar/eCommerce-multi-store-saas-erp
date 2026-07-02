/**
 * Core features are part of every store's account regardless of subscription
 * plan. They cover account/self-management capabilities that a store must
 * always be able to use (managing their own team, roles, settings, and viewing
 * their audit trail). These are never plan-gated.
 *
 * The slugs here must match the `feature` prefix of the corresponding
 * permission codes (e.g. `users:read` → feature `users`).
 */
export const CORE_FEATURE_SLUGS: ReadonlySet<string> = new Set(['users', 'settings', 'audit-logs'])

/**
 * Whether a feature slug is a plan-independent core feature.
 */
export function isCoreFeature(featureSlug: string): boolean {
  return CORE_FEATURE_SLUGS.has(featureSlug)
}

/**
 * Normalizes an array of feature keys.
 * Deduplicates and removes empty entries.
 */
export function normalizeFeatures(features: string[]): string[] {
  if (!features || !Array.isArray(features)) return []
  return Array.from(new Set(features.map((f) => f.trim()).filter(Boolean)))
}

/**
 * Maps permission prefixes (first part of "module:action" permission code)
 * to their parent plan entitlement feature slug.
 */
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

/**
 * Resolves the parent subscription plan feature slug for a given permission sub-feature slug.
 */
export function getPlanFeature(featureSlug: string): string {
  return PERMISSION_FEATURE_TO_PLAN_FEATURE[featureSlug] || featureSlug
}
