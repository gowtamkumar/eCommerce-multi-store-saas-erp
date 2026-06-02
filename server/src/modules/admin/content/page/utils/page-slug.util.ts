/** Normalize slug for storage: home pages use empty string; others sanitize and remove unsafe characters. */
export function normalizePageSlug(slug: string | undefined | null, isHomePage?: boolean): string {
  if (isHomePage) return ''
  if (!slug) return ''
  return slug
    .toLowerCase()
    .normalize('NFD')                  // decompose accented characters
    .replace(/[\u0300-\u036f]/g, '')   // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')      // remove non-alphanumeric (keep spaces & hyphens)
    .trim()
    .replace(/[\s_]+/g, '-')           // spaces/underscores → hyphens
    .replace(/-{2,}/g, '-')            // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '')           // strip leading/trailing hyphens
}

/** Slug used for public URL path segment (empty for home). */
export function slugForPublicLookup(slug: string | undefined | null): string {
  return normalizePageSlug(slug, false)
}
