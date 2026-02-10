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

    @Column({ nullable: true })
    brandName: string;

    @Column({ nullable: true })
    siteDescription: string;

    @Column({ nullable: true })
    contactEmail: string;

    @Column({ nullable: true })
    contactPhone: string;

    @Column({ nullable: true })
    whatsappPhone: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    currency: string;

    @Column({ nullable: true })
    currencySymbol: string;

    @Column({ type: 'jsonb', nullable: true })
    supportedCurrencies?: CurrenciesDto[];

    @Column({ type: 'jsonb', nullable: true })
    socialLinks?: SocialLinkDto;


    @Column({ type: 'jsonb', nullable: true })
    marketing?: MarketingDto

    @Column({ type: 'jsonb', nullable: true })
    smtp?: SmtpDto

    @Column({ type: 'jsonb', nullable: true })
    payment?: PaymentDto

    @Column({ type: 'jsonb', nullable: true })
    pathaoCourier?: PathaoCourierDto

    @Column({ type: 'jsonb', nullable: true })
    steadfastCourier?: SteadfastCourierDto

    @Column({ type: 'jsonb', nullable: true })
    navbarLinks?: NavbarLinkDto[]

    @Column({ nullable: true })
    footerDescription?: string;

    @Column({ nullable: true })
    footerCopyright?: string;

    @Column({ type: 'jsonb', nullable: true })
    footerSections?: FooterSectionDto[]

    @Column({ type: 'jsonb', nullable: true })
    trustBadges?: TrustBadgeDto[]

    @Column({ type: 'uuid', unique: true })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenantId' })
    tenant: TenantEntity;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
