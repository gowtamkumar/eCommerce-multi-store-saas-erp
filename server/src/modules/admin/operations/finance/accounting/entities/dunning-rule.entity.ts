import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity('dunning_rules')
export class DunningRuleEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @Column({ type: 'integer', name: 'dunning_level' })
  dunningLevel: number

  @Column({ type: 'integer', name: 'days_overdue' })
  daysOverdue: number

  @Column({ type: 'varchar', length: 50 })
  action: 'EMAIL' | 'CREDIT_HOLD' | 'EMAIL_AND_HOLD'

  @Column({ type: 'varchar', name: 'email_subject', length: 255 })
  emailSubject: string

  @Column({ type: 'text', name: 'email_body' })
  emailBody: string
}
