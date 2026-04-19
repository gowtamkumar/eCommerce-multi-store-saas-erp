import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { CampaignEntity } from './campaign.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { CampaignLogStatus } from '../enums/campaign-log-status.enum'

@Entity('campaign_logs')
@Index(['campaignId', 'status'])
@Index(['userId', 'status'])
export class CampaignLogEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'campaign_id' })
  campaignId: string

  @ManyToOne(() => CampaignEntity, (campaign) => campaign.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: CampaignEntity

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  recipient: UserEntity

  @Column({
    type: 'enum',
    enum: CampaignLogStatus,
    default: CampaignLogStatus.PENDING,
  })
  status: CampaignLogStatus

  @Column({ type: 'timestamp', name: 'sent_at', nullable: true })
  sentAt: Date

  @Column({ type: 'text', nullable: true })
  error: string

  @Column({ type: 'jsonb', nullable: true, name: 'metadata' })
  metadata: any
}
