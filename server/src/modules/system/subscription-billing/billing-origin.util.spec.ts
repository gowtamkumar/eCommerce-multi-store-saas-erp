import { CustomDomainStatus } from '@/common/enums/tenant/custom-domain-status'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { buildAllowedBillingOrigins, resolveSafeBillingUrl } from './billing-origin.util'

function tenantFixture(overrides: Partial<TenantEntity> = {}): TenantEntity {
  return {
    subdomain: 'acme',
    customDomain: null as unknown as string,
    customDomainStatus: CustomDomainStatus.PENDING,
    ...overrides,
  } as TenantEntity
}

describe('buildAllowedBillingOrigins', () => {
  it('always includes the platform FRONTEND_URL', () => {
    const origins = buildAllowedBillingOrigins(null, {
      frontendUrl: 'https://app.omnicart.com',
      nodeEnv: 'production',
    })
    expect(origins.has('https://app.omnicart.com')).toBe(true)
  })

  it('includes tenant subdomain on platform host', () => {
    const tenant = tenantFixture({ subdomain: 'acme' })
    const origins = buildAllowedBillingOrigins(tenant, {
      frontendUrl: 'https://app.omnicart.com',
      platformHost: 'omnicart.com',
      nodeEnv: 'production',
    })
    expect(origins.has('https://acme.omnicart.com')).toBe(true)
  })

  it('only includes custom domain when ACTIVE', () => {
    const tenant = tenantFixture({
      customDomain: 'shop.example.com',
      customDomainStatus: CustomDomainStatus.PENDING,
    })
    const origins = buildAllowedBillingOrigins(tenant, {
      frontendUrl: 'https://app.omnicart.com',
      nodeEnv: 'production',
    })
    expect(origins.has('https://shop.example.com')).toBe(false)

    const activeTenant = tenantFixture({
      customDomain: 'shop.example.com',
      customDomainStatus: CustomDomainStatus.ACTIVE,
    })
    const origins2 = buildAllowedBillingOrigins(activeTenant, {
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
