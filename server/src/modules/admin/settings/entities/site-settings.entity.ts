import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import {
  BrandingSettingsDto,
  CurrenciesDto,
  FinanceConfigDto,
  FooterSettingsDto,
  LabelSettingsDto,
  MarketingDto,
  NavbarSettingsDto,
  PathaoCourierDto,
  PaymentDto,
  ProductsPageSettingsDto,
  SingleProductPageSettingsDto,
  OffersPageSettingsDto,
  SmtpDto,
  SocialLinkDto,
  SteadfastCourierDto,
  ThemeSettingsDto,
  TrustBadgeDto,
  ShippingConfigDto,
  SmsDto,
} from '../dto/index'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'

@Entity('site_settings')
export class SiteSettingsEntity extends BaseEntity {
  @Column({ nullable: true })
  logo: string

  @Column({ nullable: true })
  favicon: string

  @Column({ name: 'brand_name', nullable: true })
  brandName: string

  @Column({ name: 'site_description', nullable: true })
  siteDescription: string

  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string

  @Column({ name: 'contact_email', nullable: true })
  contactEmail: string

  @Column({ name: 'contact_phone', nullable: true })
  contactPhone: string

  @Column({ name: 'whatsapp_phone', nullable: true })
  whatsappPhone: string

  @Column({ nullable: true })
  address: string

  @Column({ nullable: true })
  currency: string

  @Column({ name: 'currency_symbol', nullable: true })
  currencySymbol: string

  @Column({ type: 'jsonb', name: 'supported_currencies', nullable: true })
  supportedCurrencies?: CurrenciesDto[]

  @Column({ name: 'remove_branding', type: 'boolean', default: false })
  removeBranding: boolean

  @Column({ type: 'jsonb', name: 'social_links', nullable: true })
  socialLinks?: SocialLinkDto

  @Column({ type: 'jsonb', nullable: true })
  marketing?: MarketingDto

  @Column({ type: 'jsonb', nullable: true })
  smtp?: SmtpDto

  @Column({ type: 'jsonb', nullable: true })
  sms?: SmsDto

  @Column({ type: 'jsonb', nullable: true })
  payment?: PaymentDto

  @Column({ type: 'jsonb', name: 'pathao_courier', nullable: true })
  pathaoCourier?: PathaoCourierDto

  @Column({ type: 'jsonb', name: 'steadfast_courier', nullable: true })
  steadfastCourier?: SteadfastCourierDto

  @Column({ type: 'jsonb', name: 'shipping_config', nullable: true })
  shippingConfig?: ShippingConfigDto

  @Column({ type: 'jsonb', name: 'finance_config', nullable: true })
  financeConfig?: FinanceConfigDto

  @Column({ type: 'jsonb', name: 'navbar', nullable: true })
  navbar?: NavbarSettingsDto

  @Column({ type: 'jsonb', name: 'footer', nullable: true })
  footer?: FooterSettingsDto

  @Column({ type: 'jsonb', name: 'trust_badges', nullable: true })
  trustBadges?: TrustBadgeDto[]

  @Column({ type: 'jsonb', name: 'products_page', nullable: true })
  productsPage?: ProductsPageSettingsDto

  @Column({ type: 'jsonb', name: 'single_product_page', nullable: true })
  singleProductPage?: SingleProductPageSettingsDto

  @Column({ type: 'jsonb', name: 'offers_page', nullable: true })
  offersPage?: OffersPageSettingsDto

  @Column({ type: 'text', name: 'robots_txt', nullable: true })
  robotsTxt?: string

  @Column({ type: 'jsonb', name: 'label_settings', nullable: true })
  labelSettings?: LabelSettingsDto

  @Column({ type: 'varchar', length: 64, nullable: true })
  timezone?: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  locale?: string

  @Column({ type: 'jsonb', nullable: true })
  theme?: ThemeSettingsDto

  @Column({ type: 'uuid', name: 'default_branch_id', nullable: true })
  defaultBranchId?: string

  @Column({ type: 'jsonb', nullable: true })
  branding?: BrandingSettingsDto

  @Column({ type: 'uuid', name: 'tenant_id', unique: true })
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
