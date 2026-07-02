import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { DiscountType } from '@/common/enums/discount-type.enum'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

/** Fast code lookups — used on every coupon validation */
@Index(['storeId', 'code'], { unique: true })
/** Optimizes the active-coupons dashboard filter */
@Index(['storeId', 'isActive', 'expiryDate'])
@Entity('coupons')
export class CouponEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  code: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string

  @Column({ type: 'enum', enum: DiscountType, default: DiscountType.PERCENTAGE })
  discountType: DiscountType

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number

  @Column({ type: 'decimal', name: 'min_purchase_amount', precision: 10, scale: 2, default: 0 })
  minPurchaseAmount: number

  @Column({ type: 'timestamp', name: 'start_date', nullable: true })
  startDate: Date

  @Column({ type: 'timestamp', name: 'expiry_date', nullable: true })
  expiryDate: Date

  @Column({ type: 'int', name: 'usage_limit', nullable: true })
  usageLimit: number

  @Column({ type: 'int', name: 'used_count', default: 0 })
  usedCount: number

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
