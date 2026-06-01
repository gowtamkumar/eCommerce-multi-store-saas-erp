import { Expose } from 'class-transformer'

/**
 * Settings response DTO.
 * IMPORTANT: Sensitive JSONB fields (smtp, payment, pathaoCourier, steadfastCourier)
 * are intentionally excluded to prevent leaking API keys and credentials.
 * Use dedicated admin-only endpoints to expose those fields when absolutely necessary.
 */
export class SiteSettingsResponseDto {
  @Expose()
  id: string

  @Expose()
  logo: string

  @Expose()
  brandName: string

  @Expose()
  siteDescription: string

  @Expose()
  contactEmail: string

  @Expose()
  contactPhone: string

  @Expose()
  whatsappPhone: string

  @Expose()
  address: string

  @Expose()
  currency: string

  @Expose()
  currencySymbol: string

  @Expose()
  supportedCurrencies: any[]

  @Expose()
  removeBranding: boolean

  @Expose()
  socialLinks: any

  @Expose()
  marketing: any

  // smtp — intentionally EXCLUDED (contains credentials)
  // payment — intentionally EXCLUDED (contains API keys)
  // pathaoCourier — intentionally EXCLUDED (contains API keys)
  // steadfastCourier — intentionally EXCLUDED (contains API keys)

  @Expose()
  shippingConfig: any

  @Expose()
  navbar: any

  @Expose()
  footer: any

  @Expose()
  trustBadges: any[]

  @Expose()
  productsPage: any

  @Expose()
  singleProductPage: any

  @Expose()
  offersPage: any

  @Expose()
  robotsTxt: string

  @Expose()
  labelSettings: any

  @Expose()
  tenantId: string

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date

  // Appended by service (not from entity column)
  @Expose()
  status: string
}
