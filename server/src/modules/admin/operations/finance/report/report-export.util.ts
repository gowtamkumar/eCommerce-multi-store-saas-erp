const SUCCESSFUL_PAYMENT_STATUSES = new Set(['completed', 'paid', 'success'])
const FORMULA_PREFIXES = new Set(['=', '+', '-', '@'])

export function isSuccessfulPaymentStatus(status: unknown): boolean {
  if (typeof status !== 'string') return false
  return SUCCESSFUL_PAYMENT_STATUSES.has(status.trim().toLowerCase())
}

export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return ''

  if (value instanceof Date) {
    return value.toISOString()
  }

  const rawValue = String(value)
  const trimmedValue = rawValue.trimStart()
  const shouldNeutralizeFormula =
    typeof value === 'string' &&
    trimmedValue.length > 0 &&
    (FORMULA_PREFIXES.has(trimmedValue[0]) ||
      trimmedValue.startsWith('\t') ||
      trimmedValue.startsWith('\r'))
  const safeValue = shouldNeutralizeFormula ? `'${rawValue}` : rawValue

  if (/[",\r\n]/.test(safeValue)) {
    return `"${safeValue.replace(/"/g, '""')}"`
  }

  return safeValue
}

export function csvRow(values: unknown[]): string {
  return `${values.map(escapeCsvCell).join(',')}\n`
}
