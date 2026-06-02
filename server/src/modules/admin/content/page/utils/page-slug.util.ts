/** Normalize slug for storage: home pages use empty string; others strip leading slashes. */
export function normalizePageSlug(slug: string | undefined | null, isHomePage?: boolean): string {
  if (isHomePage) return ''
  if (!slug) return ''
  return slug.replace(/^\/+/, '').trim()
}

/** Slug used for public URL path segment (empty for home). */
export function slugForPublicLookup(slug: string | undefined | null): string {
  return normalizePageSlug(slug, false)
}
