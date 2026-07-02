import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { StoreEntity } from '@/modules/system/store/entities/store.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { CampaignStatus } from '../enums/campaign-status.enum'
import { CampaignType } from '../enums/campaign-type.enum'
import { CampaignMessageEntity } from './campaign-message.entity'
import { CampaignLogEntity } from './campaign-log.entity'

@Entity('campaigns')
@Index(['storeId', 'status'])
@Index(['storeId', 'scheduleTime'])
export class CampaignEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({
    type: 'enum',
    enum: CampaignType,
    default: CampaignType.EMAIL,
  })
  type: CampaignType

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus

  @Column({ type: 'timestamp', name: 'schedule_time', nullable: true })
  scheduleTime: Date

  @Column({ type: 'uuid', name: 'store_id' })
  storeId: string

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @OneToMany(() => CampaignMessageEntity, (message) => message.campaign)
  messages: CampaignMessageEntity[]

  @OneToMany(() => CampaignLogEntity, (log) => log.campaign)
  logs: CampaignLogEntity[]

  @Column({ type: 'int', default: 0, name: 'total_audience' })
  totalAudience: number

  @Column({ type: 'int', default: 0, name: 'sent_count' })
  sentCount: number

  @Column({ type: 'int', default: 0, name: 'failed_count' })
  failedCount: number

  @Column({ type: 'boolean', name: 'target_users', default: true })
  targetUsers: boolean

  @Column({ type: 'boolean', name: 'target_subscribers', default: false })
  targetSubscribers: boolean

  @Column({ type: 'boolean', name: 'target_leads', default: false })
  targetLeads: boolean
}
