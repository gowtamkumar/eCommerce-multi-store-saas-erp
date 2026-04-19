import { BaseEntity } from '@/common/base-entity/BaseEntity'
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'

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
    }
  }

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity
}
