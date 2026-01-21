import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ProductStatus } from '../../../common/enums/product-status.enum';
import { CategoryEntity } from '../../category/entities/category.entity';
import { FaqEntity } from '../../faq/entities/faq.entity';
import { TenantEntity } from '../../tenant/entities/tenant.entity';
import { ProductAttributeEntity } from './attribute.entity';
import { ProductVariantEntity } from './variant.entity';

@Entity('products')
export class ProductEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    slug: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'text', nullable: true })
    shortDescription: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    discountAmount: number;

    @Column({ type: 'simple-array' })
    images: string[];

    @Column({ type: 'simple-array', nullable: true })
    features: string[];

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({
        type: 'enum',
        enum: ProductStatus,
        default: ProductStatus.INACTIVE,
    })
    status: ProductStatus;

    @Column({ type: 'uuid', nullable: true })
    categoryId: string;

    @ManyToOne(() => CategoryEntity, (category) => category.products, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'categoryId' })
    category: CategoryEntity;

    @Column({
        type: 'enum',
        enum: ['testimonials', 'reviews'],
        default: 'testimonials',
    })
    reviewSectionType: string;

    @OneToMany(() => FaqEntity, (faq) => faq.product)
    faqs: FaqEntity[];

    @OneToMany(() => ProductAttributeEntity, (attr) => attr.product)
    attributes: ProductAttributeEntity[];

    @OneToMany(() => ProductVariantEntity, (variant) => variant.product)
    variants: ProductVariantEntity[];

    @Column({ type: 'uuid' })
    tenantId: string;

    @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenantId' })
    tenant: TenantEntity;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
