import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { CampaignLogStatus } from '../enums/campaign-log-status.enum'
import { CampaignEntity } from './campaign.entity'

@Entity('campaign_logs')
@Index(['campaignId', 'status'])
@Index(['userId', 'status'])
// Idempotency guard for campaign dispatch — see migration
// 1780600000000-MarketingMarketingHardening for the partial unique that
// also covers the WHERE recipient_key IS NOT NULL case.
@Index('UQ_campaign_logs_campaign_recipient', ['campaignId', 'recipientKey'], { unique: true })
export class CampaignLogEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'campaign_id' })
  campaignId: string

  @ManyToOne(() => CampaignEntity, (campaign) => campaign.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: CampaignEntity

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  recipient: UserEntity

  /**
   * Channel-aware unique recipient identifier:
   *   - EMAIL → lowercase email
   *   - SMS   → E.164-normalized phone
   *   - PUSH  → userId
   * Used as part of the campaign-log unique index and the BullMQ jobId
   * so a retry/dup never sends twice to the same person.
   */
  @Column({ type: 'varchar', length: 255, name: 'recipient_key', nullable: true })
  recipientKey: string | null

  @Column({
    type: 'enum',
    enum: CampaignLogStatus,
    default: CampaignLogStatus.PENDING,
  })
  status: CampaignLogStatus

  @Column({ type: 'timestamp', name: 'sent_at', nullable: true })
  sentAt: Date

  /** Soft delivery confirmation — opened pixel, push delivery receipt, etc. */
  @Column({ type: 'timestamp', name: 'opened_at', nullable: true })
  openedAt: Date | null

  /** Last time the recipient clicked through to a tracked link in this campaign */
  @Column({ type: 'timestamp', name: 'clicked_at', nullable: true })
  clickedAt: Date | null

  @Column({ type: 'text', nullable: true })
  error: string

  @Column({ type: 'jsonb', nullable: true, name: 'metadata' })
  metadata: any
}
