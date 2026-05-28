import { randomBytes, randomInt } from 'crypto'

/**
 * Generates a collision-safe random suffix of exactly `length` uppercase alphanumeric characters.
 * Uses `crypto.randomBytes` — cryptographically strong, unlike `Math.random()`.
 *
 * @param length - Number of characters in the suffix (default: 6)
 */
function randomSuffix(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length }, () => chars[randomBytes(1)[0] % chars.length]).join('')
}

/**
 * Generates a valid EAN-13 barcode using the '20' private-label prefix.
 *
 * Prefix '20' is globally reserved for in-store / private-label items (GS1 standard).
 * This ensures the generated barcode will never collide with a real retail product barcode.
 *
 * Structure: [20][9 random digits][1 checksum digit]  = 13 digits total
 *
 * @returns A 13-digit EAN-13 compliant barcode string
 */
export function generateEAN13(): string {
  // '20' prefix (2 digits) + 9 cryptographically random digits = 11 digits
  const prefix = '20'
  const body = Array.from({ length: 10 }, () => randomInt(0, 10)).join('')
  const digits12 = (prefix + body).substring(0, 12)

  // Standard EAN-13 checksum: alternating weights 1 and 3
  const checkDigit =
    (10 -
      (digits12
        .split('')
        .reduce((sum, d, i) => sum + parseInt(d, 10) * (i % 2 === 0 ? 1 : 3), 0) %
        10)) %
    10

  return digits12 + checkDigit.toString()
}

/**
 * Generates a unique SKU for a **base product** from its name or slug.
 *
 * Format:  [NAMEPREFIX]-[SUFFIX]
 * Example: COFFEMUG-A3K9Z1
 *
 * @param nameOrSlug - Product name or URL slug
 * @param prefixLength - Max characters to use from the name (default: 8)
 * @param suffixLength - Length of the random suffix (default: 6)
 */
export function generateProductSku(
  nameOrSlug: string,
  prefixLength = 8,
  suffixLength = 6,
): string {
  const prefix = nameOrSlug
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // strip non-alphanumeric
    .substring(0, prefixLength)
    .padEnd(3, 'X') // ensure at least 3 chars if name is very short

  return `${prefix}-${randomSuffix(suffixLength)}`
}

/**
 * Generates a unique SKU for a **product variant** from its parent product slug
 * and the variant's combination object (e.g. { Color: 'Red', Size: 'XL' }).
 *
 * Format:  [SLUG-VARIANTS]-[SUFFIX]
 * Example: COTTONPOLO-RED-XL-A3K9Z1
 *
 * @param productSlug - URL slug of the parent product
 * @param combination - Variant attribute key-value map
 * @param suffixLength - Length of the random suffix (default: 6)
 */
export function generateVariantSku(
  productSlug: string,
  combination: Record<string, string>,
  suffixLength = 6,
): string {
  const variantPart = Object.values(combination)
    .map((v) => String(v).toUpperCase().replace(/[^A-Z0-9]/g, ''))
    .filter(Boolean)
    .join('-')

  const base = variantPart
    ? `${productSlug.toUpperCase()}-${variantPart}`
    : productSlug.toUpperCase()

  return `${base}-${randomSuffix(suffixLength)}`
}
