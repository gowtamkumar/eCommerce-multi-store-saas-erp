import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { TenantEntity } from '../../tenant/entities/tenant.entity';
import { CurrenciesDto, FooterSectionDto, MarketingDto, NavbarLinkDto, PathaoCourierDto, PaymentDto, SmtpDto, SocialLinkDto, SteadfastCourierDto, TrustBadgeDto } from '../dto/index';


@Entity('site_settings')
export class SiteSettingsEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

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

    @Column({ type: 'jsonb', name: 'navbar_links', nullable: true })
    navbarLinks?: NavbarLinkDto[]

    @Column({ name: 'footer_description', nullable: true })
    footerDescription?: string;

    @Column({ name: 'footer_copyright', nullable: true })
    footerCopyright?: string;

    @Column({ type: 'jsonb', name: 'footer_sections', nullable: true })
    footerSections?: FooterSectionDto[]

    @Column({ type: 'jsonb', name: 'trust_badges', nullable: true })
    trustBadges?: TrustBadgeDto[]

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;
}
