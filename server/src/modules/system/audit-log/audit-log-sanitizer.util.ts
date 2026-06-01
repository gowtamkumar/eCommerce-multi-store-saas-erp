const SENSITIVE_KEYS = new Set([
  'accessToken',
  'apiKey',
  'authorization',
  'cardNumber',
  'currentPassword',
  'cvv',
  'emailVerificationToken',
  'newPassword',
  'oldPassword',
  'password',
  'refreshToken',
  'resetPasswordToken',
  'secret',
  'token',
])

const REDACTED_VALUE = '[REDACTED]'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)
  )
}

function shouldRedactKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key) || key.toLowerCase().includes('password')
}

export function sanitizeAuditValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeAuditValue(item)) as T
  }

  if (!isPlainObject(value)) {
    return value
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, nestedValue] of Object.entries(value)) {
    sanitized[key] = shouldRedactKey(key) ? REDACTED_VALUE : sanitizeAuditValue(nestedValue)
  }

  return sanitized as T
}
