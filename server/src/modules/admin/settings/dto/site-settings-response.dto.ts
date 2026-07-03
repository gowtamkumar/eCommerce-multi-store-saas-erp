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
  favicon: string

  @Expose()
  brandName: string

  @Expose()
  siteDescription: string

  @Expose()
  metaTitle: string

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

  @Expose()
  smtp: any

  @Expose()
  payment: any

  @Expose()
  pathaoCourier: any

  @Expose()
  steadfastCourier: any

  @Expose()
  sms: any

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
  timezone: string

  @Expose()
  locale: string

  @Expose()
  theme: any

  @Expose()
  defaultBranchId: string

  @Expose()
  branding: any

  @Expose()
  storeId: string

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date

  // Appended by service (not from entity column)
  @Expose()
  status: string
}
