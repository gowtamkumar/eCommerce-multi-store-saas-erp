/**
 * Subdomain validation for tenant onboarding.
 *
 * Two protections live here:
 *   1. A reserved-word blocklist so tenants can never claim infrastructure /
 *      brand hostnames (e.g. `api.mysaas.com`, `admin.mysaas.com`) that would
 *      shadow first-party services or enable phishing.
 *   2. A strict DNS-label format check (a single label, 1-63 chars, no leading
 *      or trailing hyphen) so a malicious value can't smuggle dots, paths or
 *      whitespace into downstream host/DNS handling.
 */

export class InvalidSubdomainError extends Error {}

/**
 * Hostnames we never hand out to tenants. Includes common infra/service names,
 * auth-flow paths and a few generic reserved labels. Keep this lowercase.
 */
export const RESERVED_SUBDOMAINS = new Set<string>([
  'admin',
  'api',
  'app',
  'apps',
  'assets',
  'auth',
  'billing',
  'blog',
  'cdn',
  'console',
  'dashboard',
  'dev',
  'docs',
  'ftp',
  'gateway',
  'help',
  'host',
  'imap',
  'internal',
  'login',
  'logout',
  'mail',
  'media',
  'mx',
  'ns',
  'ns1',
  'ns2',
  'partner',
  'pop',
  'portal',
  'register',
  'root',
  'signup',
  'smtp',
  'ssl',
  'staging',
  'static',
  'status',
  'store',
  'super',
  'superadmin',
  'support',
  'system',
  'test',
  'webmail',
  'www',
])

// A single DNS label: 1-63 chars, alphanumeric, internal hyphens allowed but
// not leading/trailing.
const SUBDOMAIN_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

/**
 * Normalise (trim + lowercase) and validate a requested subdomain. Throws
 * InvalidSubdomainError with a user-facing message on any violation; otherwise
 * returns the canonical (lowercased) label callers should persist.
 */
export function normalizeSubdomain(input: string): string {
  if (typeof input !== 'string') {
    throw new InvalidSubdomainError('Subdomain must be a string')
  }
  const subdomain = input.trim().toLowerCase()
  if (!subdomain) {
    throw new InvalidSubdomainError('Subdomain is required')
  }
  if (subdomain.length > 63) {
    throw new InvalidSubdomainError('Subdomain must be 63 characters or fewer')
  }
  if (!SUBDOMAIN_RE.test(subdomain)) {
    throw new InvalidSubdomainError(
      'Subdomain may only contain lowercase letters, numbers and hyphens, and cannot start or end with a hyphen',
    )
  }
  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    throw new InvalidSubdomainError(`"${subdomain}" is a reserved subdomain and cannot be used`)
  }
  return subdomain
}

export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.has(subdomain.trim().toLowerCase())
}
