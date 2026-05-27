/**
 * Normalizes an array of feature keys.
 * Deduplicates and removes empty entries.
 */
export function normalizeFeatures(features: string[]): string[] {
  if (!features || !Array.isArray(features)) return []
  return Array.from(new Set(features.map((f) => f.trim()).filter(Boolean)))
}
