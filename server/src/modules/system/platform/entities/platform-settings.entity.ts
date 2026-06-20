import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { PlatformAiConfig } from '@/common/types/platform-ai-config.types'
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { SmtpDto } from '@/modules/admin/settings/dto/smtp.dto'
import { SmsDto } from '@/modules/admin/settings/dto/sms.dto'

@Entity('platform_settings')
export class PlatformSettingsEntity extends BaseEntity {
  @Column({ nullable: true, name: 'brand_name' })
  brandName: string

  @Column({ nullable: true, name: 'brand_logo' })
  brandLogo: string

  @Column({ nullable: true, name: 'support_email' })
  supportEmail: string

  @Column({ type: 'jsonb', nullable: true })
  hero: {
    badge: string
    title: string
    description: string
    primaryBtnText: string
    primaryBtnLink: string
    secondaryBtnText: string
    secondaryBtnLink: string
    image: string
  }

  @Column({ type: 'jsonb', nullable: true })
  features: Array<{
    icon: string
    title: string
    description: string
  }>

  @Column({ type: 'jsonb', nullable: true })
  footer: {
    description: string
    copyright: string
    socials: {
      facebook: string
      twitter: string
      instagram: string
      linkedin: string
      github: string
    }
  }

  @Column({ type: 'jsonb', nullable: true })
  seo: {
    metaTitle: string
    metaDescription: string
    ogImage: string
  }

  @Column({ name: 'is_maintenance_mode', type: 'boolean', default: false })
  isMaintenanceMode: boolean

  @Column({ name: 'maintenance_message', type: 'text', nullable: true })
  maintenanceMessage: string

  @Column({ name: 'ai_config', type: 'jsonb', nullable: true })
  aiConfig: PlatformAiConfig | null

  @Column({ type: 'jsonb', nullable: true })
  smtp: SmtpDto | null

  @Column({ type: 'jsonb', nullable: true })
  sms: SmsDto | null

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
