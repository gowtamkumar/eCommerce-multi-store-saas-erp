import { SkipThrottle } from '@nestjs/throttler'

/** Every named bucket from AppThrottlerModule — use on read-only / polling routes. */
export const SKIP_ALL_THROTTLES = {
  default: true,
  standard: true,
  sensitive: true,
  transactional: true,
  promo: true,
  ai: true,
  'ai-storefront': true,
} as const

export const SkipAllThrottles = () => SkipThrottle({ ...SKIP_ALL_THROTTLES })

/** Admin AI controller: only the `ai` bucket should apply to generate routes. */
export const SkipNonAiAdminThrottles = () =>
  SkipThrottle({
    default: true,
    standard: true,
    sensitive: true,
    transactional: true,
    promo: true,
    'ai-storefront': true,
  })

/** Storefront assistant chat: only the `ai-storefront` bucket should apply. */
export const SkipNonStorefrontAiThrottles = () =>
  SkipThrottle({
    default: true,
    standard: true,
    sensitive: true,
    transactional: true,
    promo: true,
    ai: true,
  })
