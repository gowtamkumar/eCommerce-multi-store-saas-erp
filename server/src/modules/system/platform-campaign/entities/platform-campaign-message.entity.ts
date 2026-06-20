import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { PlatformCampaignEntity } from './platform-campaign.entity'

@Entity('platform_campaign_messages')
export class PlatformCampaignMessageEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'platform_campaign_id' })
  platformCampaignId: string

  @ManyToOne(() => PlatformCampaignEntity, (campaign) => campaign.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'platform_campaign_id' })
  platformCampaign: PlatformCampaignEntity

  // Email specific
  @Column({ type: 'varchar', length: 255, nullable: true })
  subject: string

  @Column({ type: 'text', nullable: true, name: 'html_content' })
  htmlContent: string

  // SMS specific
  @Column({ type: 'text', nullable: true })
  text: string

  // Push specific
  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string

  @Column({ type: 'text', nullable: true })
  body: string

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'image_url' })
  imageUrl: string
}
