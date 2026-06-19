import { ProductStatus } from '@/common/enums/product-status.enum'

export const IMPORT_DESCRIPTION_PLACEHOLDER = '(imported — description pending)'
export const MAX_PRODUCT_IMPORT_ROWS = 100

export function slugifyProductName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180)
}

export function isMissingImportedDescription(description?: string | null): boolean {
  const value = description?.trim() ?? ''
  if (!value) return true
  if (value === IMPORT_DESCRIPTION_PLACEHOLDER) return true
  return value.toLowerCase() === 'tbd' || value.toLowerCase() === 'n/a'
}

export function normalizeImportStatus(status?: string): ProductStatus {
  if (!status) return ProductStatus.INACTIVE
  const normalized = status.trim().toLowerCase()
  return normalized === ProductStatus.ACTIVE ? ProductStatus.ACTIVE : ProductStatus.INACTIVE
}
