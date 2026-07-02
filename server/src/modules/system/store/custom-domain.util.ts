import * as dns from 'dns/promises'
import * as crypto from 'crypto'

/**
 * Minimum DNS hostname validation we apply before we ever touch the
 * resolver. We reject anything that isn't a properly-formed FQDN to keep
 * malicious inputs out of the verifier (which can otherwise be turned into
 * an SSRF probe).
 */
const HOSTNAME_RE =
  /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i

const RESERVED_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0'])

export class InvalidCustomDomainError extends Error { }

export function normalizeCustomDomain(input: string): string {
  if (typeof input !== 'string') {
    throw new InvalidCustomDomainError('Custom domain must be a string')
  }
  let host = input.trim().toLowerCase()
  // Strip protocol/path/trailing slash if the operator pastes a URL.
  host = host
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
  if (!host) {
    throw new InvalidCustomDomainError('Custom domain is required')
  }
  if (RESERVED_HOSTS.has(host)) {
    throw new InvalidCustomDomainError('Reserved hostname is not allowed')
  }
  if (!HOSTNAME_RE.test(host)) {
    throw new InvalidCustomDomainError('Invalid custom domain format')
  }
  return host
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * Strict TXT verification — we look at `_omnicart-verify.<domain>` (NOT the
 * apex) so an attacker who controls a sibling subdomain on a shared parent
 * can't poison verification, and we require an exact match against the
 * issued token. Resolution failures intentionally bubble up so we don't
 * confuse "no record yet" with "wrong record".
 */
export async function verifyDomainOwnership(
  domain: string,
  expectedToken: string,
  resolver: { resolveTxt: (host: string) => Promise<string[][]> } = dns,
): Promise<{ verified: boolean; foundRecords: string[]; error?: string }> {
  if (!expectedToken) {
    return { verified: false, foundRecords: [], error: 'missing verification token' }
  }
  const recordHost = `_omnicart-verify.${domain}`
  try {
    const records = await resolver.resolveTxt(recordHost)
    const flat = records.map((chunks) => chunks.join('').trim())
    // Use timingSafeEqual to avoid leaking match length via timing — overkill
    // for DNS but cheap.
    const verified = flat.some((value) => safeEqual(value, expectedToken))
    return { verified, foundRecords: flat }
  } catch (err: any) {
    return {
      verified: false,
      foundRecords: [],
      error: err?.code || err?.message || 'lookup failed',
    }
  }
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}
