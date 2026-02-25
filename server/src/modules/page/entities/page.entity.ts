import { BaseEntity } from 'src/common/base-entity/BaseEntity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { TenantEntity } from '../../tenant/entities/tenant.entity';

@Entity('pages')
@Index(['slug', 'tenantId'], { unique: true })
export class PageEntity extends BaseEntity {

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'varchar', length: 255, default: '' })
    slug: string;

    @Column({ type: 'boolean', name: 'is_home_page', default: false })
    isHomePage: boolean;

    @Column({ type: 'int', default: 0 })
    order: number;

    @Column({ type: 'jsonb', nullable: true })
    sections: Array<{
        id: string;
        type: 'banner' | 'product-slider' | 'category-grid' | 'offer-banner' | 'review-slider' | 'text-block' | 'image-block' | 'button' | 'faq-section' | string;
        settings?: any;
        styles?: any;
        disabled?: boolean;
    }>;

    @Column({ type: 'varchar', name: 'meta_title', length: 255, nullable: true })
    metaTitle: string;

    @Column({ type: 'text', name: 'meta_description', nullable: true })
    metaDescription: string;

    @Column({ type: 'jsonb', nullable: true })
    typography: {
        fontFamily?: string;
        headingFont?: string;
        baseFontSize?: number;
        headingFontFamily?: string;
        headingFontWeight?: string;
        headingFontSize?: string;
        headingLineHeight?: string;
        paragraphFontFamily?: string;
        paragraphFontWeight?: string;
        paragraphFontSize?: string;
        paragraphLineHeight?: string;
    };

    @Column({
        type: 'enum',
        enum: ['draft', 'published'],
        default: 'published',
    })
    status: string;

    @Column({ type: 'uuid', name: 'tenant_id' })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: TenantEntity;



}
