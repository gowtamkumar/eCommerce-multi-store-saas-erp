import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { CampaignEntity } from './campaign.entity'

@Entity('campaign_messages')
export class CampaignMessageEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'campaign_id' })
  campaignId: string

  @ManyToOne(() => CampaignEntity, (campaign) => campaign.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: CampaignEntity

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
