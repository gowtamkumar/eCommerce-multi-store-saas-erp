import { headers } from 'next/headers'
import { getSiteSettings } from '@/services/getSettings'

/**
 * Per-store robots.txt. We render the store's saved `robotsTxt` string
 * verbatim when it's set (lets the store disallow/allow specific paths and
 * inject their own crawler directives) and otherwise fall back to a sane
 * default that hides admin/api surfaces.
 *
 * Using a Route Handler instead of the typed `robots.ts` lets us return the
 * raw text body the user provided without trying to parse arbitrary
 * directives into Next's MetadataRoute.Robots schema.
 */
export const dynamic = 'force-dynamic'

function defaultRobotsTxt(baseUrl: string): string {
  const lines = [
    'User-agent: *',
    'Disallow: /admin/',
    'Disallow: /api/',
    'Disallow: /checkout/',
    'Disallow: /supplier-portal/',
    'Disallow: /system/',
    'Allow: /',
  ]
  if (baseUrl) {
    lines.push('', `Sitemap: ${baseUrl}/sitemap.xml`)
  }
  return lines.join('\n') + '\n'
}

export async function GET() {
  // Resolve base URL from the host header so multi-store deployments emit
  // the right Sitemap directive without relying on a global env var that
  // would point to the SaaS landing page.
  const headerList = await headers()
  const host = headerList.get('host') ?? ''
  const proto = headerList.get('x-forwarded-proto') ?? 'https'
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    (host ? `${proto}://${host}` : '')

  let body = defaultRobotsTxt(baseUrl)
  try {
    const settings = await getSiteSettings()
    const storeRobots =
      typeof (settings as any)?.robotsTxt === 'string' &&
      (settings as any).robotsTxt.trim().length > 0
        ? (settings as any).robotsTxt
        : null
    if (storeRobots) {
      body = storeRobots.endsWith('\n') ? storeRobots : `${storeRobots}\n`
    }
  } catch {
    // Defensive: if the settings call fails we'd rather ship the safe default
    // than 500 the crawler.
  }

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Short cache so updates to the saved robots.txt show up quickly.
      'Cache-Control': 'public, max-age=300',
    },
  })
}
