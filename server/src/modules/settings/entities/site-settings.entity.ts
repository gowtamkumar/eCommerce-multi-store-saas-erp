import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { TenantEntity } from '../../tenant/entities/tenant.entity';
import { CurrenciesDto, FooterSectionDto, FooterSettingsDto, MarketingDto, NavbarLinkDto, NavbarSettingsDto, PathaoCourierDto, PaymentDto, ProductsPageSettingsDto, SingleProductPageSettingsDto, SmtpDto, SocialLinkDto, SteadfastCourierDto, TrustBadgeDto } from '../dto/index';

import { UserEntity } from 'src/modules/admin/user/entities/user.entity';

@Entity('site_settings')
export class SiteSettingsEntity extends BaseEntity {

  @Column({ nullable: true })
  logo: string;

  @Column({ name: 'brand_name', nullable: true })
  brandName: string;

  @Column({ name: 'site_description', nullable: true })
  siteDescription: string;

  @Column({ name: 'contact_email', nullable: true })
  contactEmail: string;

  @Column({ name: 'contact_phone', nullable: true })
  contactPhone: string;

  @Column({ name: 'whatsapp_phone', nullable: true })
  whatsappPhone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  currency: string;

  @Column({ name: 'currency_symbol', nullable: true })
  currencySymbol: string;

  @Column({ type: 'jsonb', name: 'supported_currencies', nullable: true })
  supportedCurrencies?: CurrenciesDto[];

  @Column({ type: 'jsonb', name: 'social_links', nullable: true })
  socialLinks?: SocialLinkDto;

  @Column({ type: 'jsonb', nullable: true })
  marketing?: MarketingDto

  @Column({ type: 'jsonb', nullable: true })
  smtp?: SmtpDto

  @Column({ type: 'jsonb', nullable: true })
  payment?: PaymentDto

  @Column({ type: 'jsonb', name: 'pathao_courier', nullable: true })
  pathaoCourier?: PathaoCourierDto

  @Column({ type: 'jsonb', name: 'steadfast_courier', nullable: true })
  steadfastCourier?: SteadfastCourierDto


  @Column({ type: 'jsonb', name: 'navbar', nullable: true })
  navbar?: NavbarSettingsDto;

  @Column({ type: 'jsonb', name: 'footer', nullable: true })
  footer?: FooterSettingsDto;

  @Column({ type: 'jsonb', name: 'trust_badges', nullable: true })
  trustBadges?: TrustBadgeDto[]

  @Column({ type: 'jsonb', name: 'products_page', nullable: true })
  productsPage?: ProductsPageSettingsDto;

  @Column({ type: 'jsonb', name: 'single_product_page', nullable: true })
  singleProductPage?: SingleProductPageSettingsDto;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;



  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
