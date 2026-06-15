/**
 * Returns the configured JWT signing/verification secret.
 *
 * Throws if it is missing so the application fails fast instead of silently
 * falling back to a well-known insecure default (which would let anyone forge
 * tokens). Used by WebSocket gateways and JWT module factories.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET_KEY
  if (!secret || secret.trim() === '') {
    throw new Error(
      'JWT_SECRET_KEY is not configured. Set a strong secret in the environment before starting the server.',
    )
  }
  return secret
}
