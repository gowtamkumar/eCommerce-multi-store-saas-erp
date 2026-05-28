import { randomBytes } from 'crypto'

/**
 * Generates a unique, collision-safe supplier/vendor code.
 * Format: VND-[6 alphanumeric uppercase characters]
 * Example: VND-A3K9Z1
 *
 * Uses `crypto.randomBytes` for cryptographically strong random generation.
 */
export function generateSupplierCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const suffix = Array.from({ length: 6 }, () => chars[randomBytes(1)[0] % chars.length]).join('')
  return `VND-${suffix}`
}
