import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { CartItemEntity } from './cart-item.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

/** Hot path: findByUserId — must not full-scan on every cart load */
@Index(['userId', 'storeId'])
@Entity('carts')
export class CartEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string
  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @OneToMany(() => CartItemEntity, (item) => item.cart, { cascade: true })
  items: CartItemEntity[]

  @Column({ type: 'varchar', length: 50, name: 'applied_coupon_code', nullable: true })
  appliedCouponCode: string | null
}
