import { IsBoolean, IsOptional, Matches, MaxLength, ValidateIf } from 'class-validator'

// Strict format guards so we never inject something weird into <script> tags
// generated downstream from these settings.
const GA_ID_RE = /^(UA-\d+-\d+|G-[A-Z0-9]{4,20}|GTM-[A-Z0-9]{4,20})$/
const FB_PIXEL_RE = /^\d{6,20}$/
const VERIFICATION_TAG_RE = /^[A-Za-z0-9_\-]+$/

export class MarketingDto {
  @ValidateIf((o, v) => v !== '' && v !== null && v !== undefined)
  @Matches(GA_ID_RE, {
    message: 'googleAnalyticsId must be a UA-, G-, or GTM- identifier',
  })
  @IsOptional()
  googleAnalyticsId?: string

  @ValidateIf((o, v) => v !== '' && v !== null && v !== undefined)
  @Matches(VERIFICATION_TAG_RE, {
    message: 'googleSiteVerification must be a single alphanumeric token',
  })
  @MaxLength(120)
  @IsOptional()
  googleSiteVerification?: string

  @ValidateIf((o, v) => v !== '' && v !== null && v !== undefined)
  @Matches(FB_PIXEL_RE, { message: 'facebookPixelId must be a numeric pixel id' })
  @IsOptional()
  facebookPixelId?: string

  @IsBoolean()
  @IsOptional()
  requireConsent?: boolean

  @ValidateIf((o, v) => v !== '' && v !== null && v !== undefined)
  @Matches(VERIFICATION_TAG_RE, {
    message: 'facebookDomainVerification must be a single alphanumeric token',
  })
  @MaxLength(120)
  @IsOptional()
  facebookDomainVerification?: string
}
