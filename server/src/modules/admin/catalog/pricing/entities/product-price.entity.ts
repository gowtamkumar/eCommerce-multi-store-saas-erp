import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { PriceBookEntity } from './price-book.entity'

@Entity('product_prices')
@Index(['storeId', 'priceBookId', 'productId'])
@Index(['storeId', 'priceBookId', 'variantId'])
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

  @Column({ type: 'uuid', name: 'store_id' })
  @Index()
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity
}
