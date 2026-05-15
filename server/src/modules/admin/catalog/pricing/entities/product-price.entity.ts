import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { PriceBookEntity } from './price-book.entity'

@Entity('product_prices')
@Index(['tenantId', 'priceBookId', 'productId'])
@Index(['tenantId', 'priceBookId', 'variantId'])
export class ProductPriceEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'price_book_id' })
  priceBookId: string

  @ManyToOne(() => PriceBookEntity, (pb) => pb.prices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'price_book_id' })
  priceBook: PriceBookEntity

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @Column({ type: 'uuid', name: 'variant_id', nullable: true })
  variantId: string

  @ManyToOne(() => ProductVariantEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariantEntity

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number

  @Column({ type: 'int', name: 'min_quantity', default: 1 })
  minQuantity: number

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId: string

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity
}
