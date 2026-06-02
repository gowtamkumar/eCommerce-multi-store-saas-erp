/** Public storefront path for a page (never produces `//`). */
export function getPagePublicPath(page: { isHomePage?: boolean; slug?: string | null }): string {
  if (page.isHomePage) return '/'
  const slug = (page.slug ?? '').replace(/^\/+/, '').trim()
  return slug ? `/${slug}` : '/'
}

/** Display slug in admin (empty string for home). */
export function formatPageSlugDisplay(page: { isHomePage?: boolean; slug?: string | null }): string {
  if (page.isHomePage) return ''
  return (page.slug ?? '').replace(/^\/+/, '').trim()
}


/** Normalize slug before save. */
export function normalizePageSlugForSave(slug: string, isHomePage: boolean): string {
  if (isHomePage) return ''
  return slug.replace(/^\/+/, '').trim()
}

/**
 * Converts a free-text title into a URL-safe slug.
 * e.g. "About Us & FAQ!" → "about-us-faq"
 */
export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')                  // decompose accented characters
    .replace(/[\u0300-\u036f]/g, '')   // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')      // remove non-alphanumeric (keep spaces & hyphens)
    .trim()
    .replace(/[\s_]+/g, '-')           // spaces/underscores → hyphens
    .replace(/-{2,}/g, '-')            // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '');          // strip leading/trailing hyphens
}
