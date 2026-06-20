import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
  ValidateNested,
  ValidateIf,
} from 'class-validator'
import { BrandingSettingsDto } from './branding-settings.dto'
import { CurrenciesDto } from './currencies.dto'
import { FooterSettingsDto } from './footerSection.dto'
import { LabelSettingsDto } from './label-settings.dto'
import { MarketingDto } from './marketing.dto'
import { NavbarSettingsDto } from './navbarLink.dto'
import { PathaoCourierDto } from './pathaoCourier.dto'
import { PaymentDto } from './payment.dto'
import { SmtpDto } from './smtp.dto'
import { SocialLinkDto } from './socialLink.dto'
import { SteadfastCourierDto } from './steadfastCourier.dto'
import { ShippingConfigDto } from './shippingConfig.dto'
import { TrustBadgeDto } from './trust-badge.dto'
import { ProductsPageSettingsDto } from './products-page.dto'
import { SingleProductPageSettingsDto } from './single-product-page.dto'
import { OffersPageSettingsDto } from './offers-page.dto'
import { SmsDto } from './sms.dto'
import { ThemeSettingsDto } from './theme-settings.dto'

const ISO_4217_RE = /^[A-Z]{3}$/
const IETF_LOCALE_RE = /^[a-z]{2,3}(-[A-Z]{2})?$/
const IANA_TIMEZONE_RE = /^[A-Za-z]+(?:[_-][A-Za-z]+)*(?:\/[A-Za-z0-9]+(?:[_-][A-Za-z0-9]+)*)+$/

export class UpdateSiteSettingsDto {
  @IsString()
  @IsOptional()
  userId?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  logo?: string

  @ApiProperty({ required: false })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  favicon?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  brandName?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  siteDescription?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  metaTitle?: string

  @ApiProperty({ required: false })
  @ValidateIf((o, v) => v !== '' && v !== null && v !== undefined)
  @IsEmail()
  @IsOptional()
  contactEmail?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  contactPhone?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  whatsappPhone?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string

  @ApiProperty({ required: false, example: 'BDT' })
  @IsString()
  @ValidateIf((o, v) => v !== '' && v !== null && v !== undefined)
  @Matches(ISO_4217_RE, { message: 'currency must be a 3-letter ISO-4217 code' })
  @IsOptional()
  currency?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  currencySymbol?: string

  @ApiProperty({ required: false, type: [CurrenciesDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CurrenciesDto)
  @IsOptional()
  supportedCurrencies?: CurrenciesDto[]

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  removeBranding?: boolean

  @ApiProperty({ required: false })
  @IsObject()
  @ValidateNested()
  @Type(() => SocialLinkDto)
  @IsOptional()
  socialLinks?: SocialLinkDto

  @ApiProperty({ required: false })
  @IsObject()
  @ValidateNested()
  @Type(() => MarketingDto)
  @IsOptional()
  marketing?: MarketingDto

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  smtp?: SmtpDto

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  sms?: SmsDto

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  payment?: PaymentDto

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  pathaoCourier?: PathaoCourierDto

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  steadfastCourier?: SteadfastCourierDto

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingConfigDto)
  shippingConfig?: ShippingConfigDto

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NavbarSettingsDto)
  navbar?: NavbarSettingsDto

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FooterSettingsDto)
  footer?: FooterSettingsDto

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  trustBadges?: TrustBadgeDto[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ProductsPageSettingsDto)
  productsPage?: ProductsPageSettingsDto

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SingleProductPageSettingsDto)
  singleProductPage?: SingleProductPageSettingsDto

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OffersPageSettingsDto)
  offersPage?: OffersPageSettingsDto

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  robotsTxt?: string

  @ApiProperty({ required: false, type: LabelSettingsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LabelSettingsDto)
  labelSettings?: LabelSettingsDto

  @ApiProperty({ required: false, example: 'Asia/Dhaka' })
  @IsString()
  @ValidateIf((o, v) => v !== '' && v !== null && v !== undefined)
  @Matches(IANA_TIMEZONE_RE, { message: 'timezone must be an IANA timezone like Asia/Dhaka' })
  @MaxLength(64)
  @IsOptional()
  timezone?: string

  @ApiProperty({ required: false, example: 'en-US' })
  @IsString()
  @ValidateIf((o, v) => v !== '' && v !== null && v !== undefined)
  @Matches(IETF_LOCALE_RE, { message: 'locale must be an IETF locale like en-US' })
  @MaxLength(20)
  @IsOptional()
  locale?: string

  @ApiProperty({ required: false, type: ThemeSettingsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ThemeSettingsDto)
  theme?: ThemeSettingsDto

  @ApiProperty({ required: false })
  @ValidateIf((o, v) => v !== '' && v !== null && v !== undefined)
  @IsUUID()
  @IsOptional()
  defaultBranchId?: string

  @ApiProperty({ required: false, type: BrandingSettingsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BrandingSettingsDto)
  branding?: BrandingSettingsDto

  @ApiProperty({ required: false, default: 90 })
  @IsInt()
  @IsOptional()
  probationDays?: number

  @ApiProperty({ required: false, default: 30 })
  @IsInt()
  @IsOptional()
  documentExpiryAlertDays?: number
}
