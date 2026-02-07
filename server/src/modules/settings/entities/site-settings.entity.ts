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
import { CurrenciesDto, FooterSectionDto, MarketingDto, NavbarLinkDto, PathaoCourierDto, PaymentDto, SmtpDto, SocialLinkDto } from '../dto/index';


@Entity('site_settings')
export class SiteSettingsEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 500, default: '' })
    logo: string;

    @Column({ type: 'varchar', length: 255, default: 'LuxeAudio' })
    brandName: string;

    @Column({
        type: 'text',
        default: 'Elevating your audio experience with premium sound and design.',
    })
    siteDescription: string;

    @Column({ type: 'varchar', length: 255, default: 'support@luxeaudio.com' })
    contactEmail: string;

    @Column({ type: 'varchar', length: 50, default: '+1 (555) 123-4567' })
    contactPhone: string;

    @Column({ type: 'varchar', length: 50, default: '+1 (555) 123-4567' })
    whatsappPhone: string;

    @Column({
        type: 'varchar',
        length: 500,
        default: '123 Audio Street, Sound City, SC 90210',
    })
    address: string;

    @Column({ type: 'varchar', length: 10, default: 'BDT' })
    currency: string;

    @Column({ type: 'varchar', length: 10, default: '৳' })
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
    navbarLinks?: NavbarLinkDto[]

    @Column({ nullable: true })
    footerDescription?: string;

    @Column({ nullable: true })
    footerCopyright?: string;

    @Column({ type: 'jsonb', nullable: true })
    footerSections?: FooterSectionDto[]

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
