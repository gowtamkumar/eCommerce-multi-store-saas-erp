import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import nestApiUrl from '@/lib/api-url'
import { getTenantId } from '@/services/tenant'

export const dynamic = 'force-dynamic'

const STATIC_ROUTES = [
  '',
  '/products',
  '/offers',
  '/contact',
  '/login',
  '/register',
] as const

/** Resolve the tenant's own canonical base URL (custom domain wins). */
async function resolveBaseUrl(): Promise<string> {
  const headerList = await headers()
  const host = headerList.get('host') ?? ''
  const proto = headerList.get('x-forwarded-proto') ?? 'https'
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    (host ? `${proto}://${host}` : 'https://example.com')
  )
}

async function fetchTenantSlugs(
  tenantId: string,
  pathPrefix: string,
  endpoint: string,
): Promise<{ url: string; lastModified?: Date }[]> {
  try {
    // We deliberately request a generous page size and treat any failure as
    // a no-op — a partial sitemap is fine, a 500'd sitemap is not.
    const res = await fetch(`${nestApiUrl}${endpoint}`, {
      headers: { 'x-tenant-id': tenantId },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    const rows: any[] = Array.isArray(data) ? data : data?.data ?? data?.items ?? []
    return rows
      .filter((row) => typeof row?.slug === 'string' && row.slug.length > 0)
      .map((row) => ({
        url: `${pathPrefix}/${row.slug}`,
        lastModified: row?.updatedAt ? new Date(row.updatedAt) : undefined,
      }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await resolveBaseUrl()
  const tenantId = await getTenantId(null, false)

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.7,
  }))

  if (!tenantId) {
    // SaaS landing — only the static marketing pages are crawl-worthy.
    return staticEntries
  }

  // Best-effort: enrich with the tenant's own pages and products. Both are
  // optional — if the endpoints don't exist or return unexpected shapes we
  // still ship the static skeleton.
  const [pageRows, productRows] = await Promise.all([
    fetchTenantSlugs(tenantId, '/pages', '/pages?published=true'),
    fetchTenantSlugs(tenantId, '/products', '/products?status=published'),
  ])

  const dynamicEntries = [...pageRows, ...productRows].map(({ url, lastModified }) => ({
    url: `${baseUrl}${url}`,
    lastModified: lastModified ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [...staticEntries, ...dynamicEntries]
}
