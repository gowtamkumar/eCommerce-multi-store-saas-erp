import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, OneToMany } from 'typeorm'
import { CampaignStatus } from '@/modules/admin/marketing/campaign/enums/campaign-status.enum'
import { CampaignType } from '@/modules/admin/marketing/campaign/enums/campaign-type.enum'
import { PlatformCampaignMessageEntity } from './platform-campaign-message.entity'
import { PlatformCampaignLogEntity } from './platform-campaign-log.entity'

@Entity('platform_campaigns')
export class PlatformCampaignEntity extends BaseEntity {
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

  @Column({ type: 'timestamp with time zone', name: 'schedule_time', nullable: true })
  scheduleTime: Date

  @OneToMany(() => PlatformCampaignMessageEntity, (message) => message.platformCampaign)
  messages: PlatformCampaignMessageEntity[]

  @OneToMany(() => PlatformCampaignLogEntity, (log) => log.platformCampaign)
  logs: PlatformCampaignLogEntity[]

  @Column({ type: 'int', default: 0, name: 'total_audience' })
  totalAudience: number

  @Column({ type: 'int', default: 0, name: 'sent_count' })
  sentCount: number

  @Column({ type: 'int', default: 0, name: 'failed_count' })
  failedCount: number

  @Column({ type: 'boolean', name: 'target_tenants', default: false })
  targetTenants: boolean

  @Column({ type: 'boolean', name: 'target_subscribers', default: false })
  targetSubscribers: boolean

  @Column({ type: 'boolean', name: 'target_users', default: false })
  targetUsers: boolean
}
