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
