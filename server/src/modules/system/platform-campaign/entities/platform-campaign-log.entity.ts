import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { CampaignLogStatus } from '@/modules/admin/marketing/campaign/enums/campaign-log-status.enum'
import { PlatformCampaignEntity } from './platform-campaign.entity'

@Entity('platform_campaign_logs')
@Index(['platformCampaignId', 'status'])
@Index(['userId', 'status'])
@Index('UQ_platform_campaign_logs_campaign_recipient', ['platformCampaignId', 'recipientKey'], { unique: true })
export class PlatformCampaignLogEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'platform_campaign_id' })
  platformCampaignId: string

  @ManyToOne(() => PlatformCampaignEntity, (campaign) => campaign.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'platform_campaign_id' })
  platformCampaign: PlatformCampaignEntity

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  recipient: UserEntity | null

  @Column({ type: 'varchar', length: 255, name: 'recipient_key', nullable: true })
  recipientKey: string | null

  @Column({
    type: 'enum',
    enum: CampaignLogStatus,
    default: CampaignLogStatus.PENDING,
  })
  status: CampaignLogStatus

  @Column({ type: 'timestamp with time zone', name: 'sent_at', nullable: true })
  sentAt: Date

  @Column({ type: 'timestamp with time zone', name: 'opened_at', nullable: true })
  openedAt: Date | null

  @Column({ type: 'timestamp with time zone', name: 'clicked_at', nullable: true })
  clickedAt: Date | null

  @Column({ type: 'text', nullable: true })
  error: string | null

  @Column({ type: 'varchar', length: 255, name: 'recipient_name', nullable: true })
  recipientName: string | null

  @Column({ type: 'varchar', length: 255, name: 'recipient_email', nullable: true })
  recipientEmail: string | null

  @Column({ type: 'varchar', length: 255, name: 'recipient_phone', nullable: true })
  recipientPhone: string | null
}
