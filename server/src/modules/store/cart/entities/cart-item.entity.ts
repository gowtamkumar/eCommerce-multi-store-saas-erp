import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { CartEntity } from './cart.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

/** Optimizes the OneToMany join when loading cart items by cart */
@Index(['cartId'])
/** Optimizes store-scoped queries and background cleanup operations */
@Index(['storeId'])
@Entity('cart_items')
export class CartItemEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'cart_id' })
  cartId: string

  @ManyToOne(() => CartEntity, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: CartEntity

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @Column({ type: 'uuid', nullable: true, name: 'variant_id' })
  variantId: string

  @ManyToOne(() => ProductVariantEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariantEntity

  @Column({ type: 'int', default: 1 })
  quantity: number

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
