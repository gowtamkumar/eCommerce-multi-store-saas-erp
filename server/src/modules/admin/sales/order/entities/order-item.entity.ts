import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { OrderEntity } from './order.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

@Entity('order_items')
export class OrderItemEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string

  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string

  @ManyToOne(() => ProductEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @Column({ type: 'uuid', nullable: true, name: 'variant_id' })
  variantId: string

  @ManyToOne(() => ProductVariantEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariantEntity

  @Column({ type: 'jsonb', nullable: true })
  snapshot: any

  @Column({ type: 'int' })
  quantity: number

  @Column({ type: 'decimal', name: 'unit_price', precision: 10, scale: 2 })
  unitPrice: number

  @Column({ type: 'decimal', name: 'discount_amount', precision: 10, scale: 2, default: 0 })
  discountAmount: number

  @Column({ type: 'decimal', name: 'tax_amount', precision: 10, scale: 2, default: 0 })
  taxAmount: number

  @Column({ type: 'decimal', name: 'total_amount', precision: 10, scale: 2 })
  totalAmount: number

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity)
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
