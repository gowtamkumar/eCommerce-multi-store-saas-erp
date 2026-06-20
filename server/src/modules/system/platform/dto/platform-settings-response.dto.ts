import { Expose } from 'class-transformer'
import { SmtpDto } from '@/modules/admin/settings/dto/smtp.dto'
import { SmsDto } from '@/modules/admin/settings/dto/sms.dto'

export class PlatformSettingsResponseDto {
  @Expose()
  id: string

  @Expose()
  brandName: string

  @Expose()
  brandLogo: string

  @Expose()
  supportEmail: string

  @Expose()
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

  @Expose()
  features: Array<{
    icon: string
    title: string
    description: string
  }>

  @Expose()
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

  @Expose()
  seo: {
    metaTitle: string
    metaDescription: string
    ogImage: string
  }

  @Expose()
  isMaintenanceMode: boolean

  @Expose()
  maintenanceMessage: string

  @Expose()
  smtp: SmtpDto

  @Expose()
  sms: SmsDto

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
