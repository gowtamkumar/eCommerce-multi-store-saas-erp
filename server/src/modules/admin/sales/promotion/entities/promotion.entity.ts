import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { PromotionType } from '../enums/promotion-type.enum'
import { PromotionTargetType } from '../enums/promotion-target-type.enum'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'

/** Optimizes the hot active-promotions query used by the storefront */
@Index(['storeId', 'isActive', 'startDate', 'endDate'])
/** Slug uniqueness must be scoped to store — see migration MarketingMarketingHardening */
@Index('UQ_promotions_store_slug', ['storeId', 'slug'], { unique: true })
@Entity('promotions')
export class PromotionEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string

  // `unique: true` here would create a global-unique index that conflicts
  // with the store-scoped composite above; we keep the column non-unique
  // and rely on the composite for the real uniqueness contract.
  @Column()
  slug: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'enum', enum: PromotionType, default: PromotionType.PERCENTAGE })
  promotionType: PromotionType

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  value: number

  @Column({ type: 'enum', enum: PromotionTargetType, default: PromotionTargetType.ENTIRE_ORDER })
  targetType: PromotionTargetType

  @Column({ type: 'uuid', name: 'target_id', nullable: true })
  targetId: string

  @Column({ type: 'decimal', name: 'min_order_value', precision: 10, scale: 2, nullable: true })
  minOrderValue: number

  @Column({ type: 'timestamp', name: 'start_date', nullable: true })
  startDate: Date

  @Column({ type: 'timestamp', name: 'end_date', nullable: true })
  endDate: Date

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
