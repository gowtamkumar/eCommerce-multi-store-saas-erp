import { CustomDomainStatus } from '@/common/enums/store/custom-domain-status'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { buildAllowedBillingOrigins, resolveSafeBillingUrl } from './billing-origin.util'

function storeFixture(overrides: Partial<StoreEntity> = {}): StoreEntity {
  return {
    subdomain: 'acme',
    domains: [],
    ...overrides,
  } as StoreEntity
}

describe('buildAllowedBillingOrigins', () => {
  it('always includes the platform FRONTEND_URL', () => {
    const origins = buildAllowedBillingOrigins(null, {
      frontendUrl: 'https://app.omnicart.com',
      nodeEnv: 'production',
    })
    expect(origins.has('https://app.omnicart.com')).toBe(true)
  })

  it('includes store subdomain on platform host', () => {
    const store = storeFixture({ subdomain: 'acme' })
    const origins = buildAllowedBillingOrigins(store, {
      frontendUrl: 'https://app.omnicart.com',
      platformHost: 'omnicart.com',
      nodeEnv: 'production',
    })
    expect(origins.has('https://acme.omnicart.com')).toBe(true)
  })

  it('only includes custom domain when ACTIVE', () => {
    const store = storeFixture({
      domains: [
        {
          hostname: 'shop.example.com',
          status: CustomDomainStatus.PENDING,
        } as any,
      ],
    })
    const origins = buildAllowedBillingOrigins(store, {
      frontendUrl: 'https://app.omnicart.com',
      nodeEnv: 'production',
    })
    expect(origins.has('https://shop.example.com')).toBe(false)

    const activeStore = storeFixture({
      domains: [
        {
          hostname: 'shop.example.com',
          status: CustomDomainStatus.ACTIVE,
        } as any,
      ],
    })
    const origins2 = buildAllowedBillingOrigins(activeStore, {
      frontendUrl: 'https://app.omnicart.com',
      nodeEnv: 'production',
    })
    expect(origins2.has('https://shop.example.com')).toBe(true)
  })

  it('excludes localhost in production', () => {
    const origins = buildAllowedBillingOrigins(null, {
      frontendUrl: 'https://app.omnicart.com',
      nodeEnv: 'production',
    })
    expect(origins.has('http://localhost:3000')).toBe(false)
  })

  it('allows localhost outside production', () => {
    const origins = buildAllowedBillingOrigins(null, {
      frontendUrl: 'https://app.omnicart.com',
      nodeEnv: 'development',
    })
    expect(origins.has('http://localhost:3000')).toBe(true)
  })
})

describe('resolveSafeBillingUrl', () => {
  const allowed = new Set(['https://app.omnicart.com', 'https://shop.example.com'])

  it('returns the candidate when its origin is whitelisted', () => {
    expect(
      resolveSafeBillingUrl(
        'https://shop.example.com/billing',
        'https://app.omnicart.com',
        allowed,
      ),
    ).toBe('https://shop.example.com/billing')
  })

  it('falls back when the candidate origin is unknown', () => {
    expect(
      resolveSafeBillingUrl(
        'https://attacker.example/billing',
        'https://app.omnicart.com',
        allowed,
      ),
    ).toBe('https://app.omnicart.com')
  })

  it('falls back on malformed URLs', () => {
    expect(resolveSafeBillingUrl('not a url', 'https://app.omnicart.com', allowed)).toBe(
      'https://app.omnicart.com',
    )
  })

  it('falls back when candidate is undefined', () => {
    expect(resolveSafeBillingUrl(undefined, 'https://app.omnicart.com', allowed)).toBe(
      'https://app.omnicart.com',
    )
  })
})
