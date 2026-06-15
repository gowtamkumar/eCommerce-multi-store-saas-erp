/**
 * Helpers to strip sensitive fields from entities before they are returned in
 * API responses. These objects are frequently spread (`{ ...user }`) into
 * response envelopes, which produces plain objects that a global
 * ClassSerializerInterceptor cannot reliably transform — so we sanitize
 * explicitly at the boundary instead.
 */

const SENSITIVE_USER_FIELDS = [
  'password',
  'refreshToken',
  'emailVerificationToken',
  'resetPasswordToken',
  'resetPasswordExpires',
] as const

/**
 * Returns a shallow copy of a user object with secret/credential fields removed.
 * Safe to call with `null`/`undefined`.
 */
export function sanitizeUser<T extends Record<string, any>>(
  user: T | null | undefined,
): Partial<T> | null {
  if (!user) return null
  const clone: Record<string, any> = { ...user }
  for (const field of SENSITIVE_USER_FIELDS) {
    delete clone[field]
  }
  return clone as Partial<T>
}

/** Strips the raw invitation token from a staff-invitation object. */
export function sanitizeInvitation<T extends Record<string, any>>(
  invitation: T | null | undefined,
): Partial<T> | null {
  if (!invitation) return null
  const clone: Record<string, any> = { ...invitation }
  delete clone.token
  return clone as Partial<T>
}
