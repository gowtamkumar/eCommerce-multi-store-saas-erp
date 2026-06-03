/**
 * Core features are part of every tenant's account regardless of subscription
 * plan. They cover account/self-management capabilities that a tenant must
 * always be able to use (managing their own team, roles, settings, and viewing
 * their audit trail). These are never plan-gated.
 *
 * The slugs here must match the `feature` prefix of the corresponding
 * permission codes (e.g. `users:read` → feature `users`).
 */
export const CORE_FEATURE_SLUGS: ReadonlySet<string> = new Set([
  'users',
  'settings',
  'audit-logs',
])

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
