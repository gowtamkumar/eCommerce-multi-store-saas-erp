import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { CartItemEntity } from './cart-item.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

@Entity('carts')
export class CartEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string
  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity

  @OneToMany(() => CartItemEntity, (item) => item.cart, { cascade: true })
  items: CartItemEntity[]

  @Column({ type: 'varchar', length: 50, name: 'applied_coupon_code', nullable: true })
  appliedCouponCode: string | null
}
