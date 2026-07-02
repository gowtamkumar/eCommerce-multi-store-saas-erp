import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { CustomDomainStatus } from '@/common/enums/store/custom-domain-status'

/**
 * Returns the canonical set of origins (`scheme://host[:port]`) that a store
 * is allowed to be redirected back to after a payment flow. Anything outside
 * this set is treated as an open-redirect attempt.
 *
 * The allow-list is composed of:
 *   - the platform fallback (FRONTEND_URL env)
 *   - the store's subdomain on the platform host (e.g. `store.platform.com`)
 *   - the store's verified custom domain (ACTIVE only)
 *
 * In development we additionally accept `localhost` and `127.0.0.1` so the
 * existing dev workflow keeps working — production deployments should set
 * NODE_ENV=production to lock this off.
 */
export function buildAllowedBillingOrigins(
  store: StoreEntity | null,
  env: {
    frontendUrl?: string
    platformHost?: string
    nodeEnv?: string
  },
): Set<string> {
  const origins = new Set<string>()

  const add = (raw?: string | null) => {
    if (!raw) return
    try {
      const u = new URL(raw)
      origins.add(`${u.protocol}//${u.host}`)
    } catch {
      // ignore malformed values
    }
  }

  add(env.frontendUrl)

  if (store?.subdomain && env.platformHost) {
    add(`https://${store.subdomain}.${env.platformHost}`)
    add(`http://${store.subdomain}.${env.platformHost}`)
  }

  if (store?.domains) {
    for (const d of store.domains) {
      if (d.status === CustomDomainStatus.ACTIVE) {
        add(`https://${d.hostname}`)
        add(`http://${d.hostname}`)
      }
    }
  }

  if ((env.nodeEnv ?? 'development') !== 'production') {
    add('http://localhost:3000')
    add('http://localhost:3001')
    add('http://127.0.0.1:3000')
    add('http://127.0.0.1:3001')
  }

  return origins
}

/**
 * Returns a safe absolute URL to use as the billing callback base. Falls back
 * to {@code fallbackUrl} (typically FRONTEND_URL) when the supplied
 * {@code candidateUrl} is unknown or malformed.
 */
export function resolveSafeBillingUrl(
  candidateUrl: string | undefined,
  fallbackUrl: string,
  allowedOrigins: Set<string>,
): string {
  if (!candidateUrl) return fallbackUrl
  try {
    const u = new URL(candidateUrl)
    const origin = `${u.protocol}//${u.host}`
    if (allowedOrigins.has(origin)) {
      return candidateUrl
    }
  } catch {
    // fall through
  }
  return fallbackUrl
}
