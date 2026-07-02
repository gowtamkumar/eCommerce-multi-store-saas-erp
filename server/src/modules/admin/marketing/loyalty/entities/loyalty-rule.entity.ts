import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity('loyalty_rules')
export class LoyaltyRuleEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ type: 'varchar', length: 50 })
  type: 'CATEGORY_MULTIPLIER' | 'MIN_SPEND_BONUS' | 'WEEKEND_MULTIPLIER'

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number

  @Column({ type: 'jsonb', nullable: true, default: {} })
  conditions: Record<string, any>

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean

  @Column({ type: 'timestamptz', name: 'start_date', nullable: true })
  startDate?: Date

  @Column({ type: 'timestamptz', name: 'end_date', nullable: true })
  endDate?: Date
}
