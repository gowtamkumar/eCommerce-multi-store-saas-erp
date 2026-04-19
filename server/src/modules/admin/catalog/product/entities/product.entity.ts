import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { DiscountType } from '@/common/enums/discount-type.enum'
import { ProductStatus } from '@/common/enums/product-status.enum'
import { ReviewEntity } from '@/modules/admin/catalog/review/entities/review.entity'
import { FaqEntity } from '@/modules/admin/content/faq/entities/faq.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { SupplierEntity } from '@/modules/admin/operations/finance/supplier/entities/supplier.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BrandEntity } from '../../brand/entities/brand.entity'
import { CategoryEntity } from '../../category/entities/category.entity'
import { ProductAttributeEntity } from './attribute.entity'
import { ProductVariantEntity } from './variant.entity'

@Entity('products')
@Index(['status'])
@Index(['createdAt'])
@Index(['tenantId', 'status']) // Hot path: storefront product list filter
@Index(['tenantId', 'createdAt']) // Hot path: ORDER BY newest products per tenant
export class ProductEntity extends BaseEntity {
  @Column()
  name: string

  @Column({ unique: true })
  @Index()
  slug: string

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'text', name: 'short_description', nullable: true })
  shortDescription: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number

  @Column({ type: 'boolean', name: 'is_review', default: true })
  isReview: boolean

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'discount_amount' })
  discountAmount: number

  @Column({
    type: 'enum',
    enum: DiscountType,
    default: DiscountType.PERCENTAGE,
    name: 'discount_type',
    nullable: true,
  })
  discountType: DiscountType

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'tax_rate', nullable: true })
  taxRate: number // Percentage, e.g. 15 = 15%

  @Column({ type: 'simple-array' })
  images: string[]

  @Column({ type: 'int', default: 0 })
  stock: number

  @Column({ type: 'int', default: 5, name: 'low_stock_threshold' })
  lowStockThreshold: number

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.INACTIVE,
  })
  status: ProductStatus

  @Column({ type: 'uuid', name: 'category_id', nullable: true })
  @Index()
  categoryId: string
  @ManyToOne(() => CategoryEntity, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity

  @Column({ type: 'uuid', name: 'brand_id', nullable: true })
  @Index()
  brandId: string

  @ManyToOne(() => BrandEntity, (brand) => brand.products, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'brand_id' })
  brand: BrandEntity

  @Column({ type: 'uuid', name: 'landing_page_id', nullable: true })
  landingPageId: string

  // @OneToOne(() => PageEntity, { nullable: true, onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'landing_page_id' })
  // landingPage: PageEntity

  @OneToMany(() => FaqEntity, (faq) => faq.product)
  faqs: FaqEntity[]

  @Column({ type: 'varchar', length: 50, default: 'manual', name: 'faq_source' })
  faqSource: string

  @Column({ type: 'simple-array', nullable: true, name: 'faq_ids' })
  faqIds: string[]

  @OneToMany(() => ProductAttributeEntity, (attribute) => attribute.product)
  attributes: ProductAttributeEntity[]

  @OneToMany(() => ProductVariantEntity, (variant) => variant.product)
  variants: ProductVariantEntity[]

  @OneToMany(() => ReviewEntity, (reviews) => reviews.product)
  reviews: ReviewEntity[]

  @Column({ type: 'uuid', name: 'supplier_id', nullable: true })
  supplierId: string

  @ManyToOne(() => SupplierEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @Column({ type: 'varchar', length: 255, name: 'meta_title', nullable: true })
  metaTitle: string

  @Column({ type: 'text', name: 'meta_description', nullable: true })
  metaDescription: string

  @Column({ type: 'varchar', length: 500, name: 'og_image', nullable: true })
  ogImage: string

  @Column({ type: 'boolean', default: false, name: 'is_new' })
  isNew: boolean

  @Column({ type: 'boolean', default: false, name: 'is_hot' })
  isHot: boolean

  @Column({ type: 'boolean', default: false, name: 'is_sale' })
  isSale: boolean
}
