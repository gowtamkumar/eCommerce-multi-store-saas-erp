import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { TenantEntity } from '../../tenant/entities/tenant.entity';

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
    supportedCurrencies: Array<{
        code: string;
        symbol: string;
        rate: number;
        name: string;
    }>;

    @Column({ type: 'jsonb', nullable: true })
    socialLinks: {
        facebook: string;
        twitter: string;
        instagram: string;
        linkedin: string;
    };

    @Column({
        type: 'enum',
        enum: ['single', 'multiple'],
        default: 'single',
    })
    productMode: string;

    @Column({ type: 'jsonb', nullable: true })
    marketing: {
        googleAnalyticsId: string;
        googleSiteVerification: string;
        facebookPixelId: string;
        facebookDomainVerification: string;
    };

    @Column({ type: 'jsonb', nullable: true })
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
        from: string;
    };

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
