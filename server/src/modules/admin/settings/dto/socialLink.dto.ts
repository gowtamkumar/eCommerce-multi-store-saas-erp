import { IsOptional, IsUrl, ValidateIf } from 'class-validator'

// Restricting protocols to https keeps storefront social links safe to embed
// in <a href> attributes and matches what every major platform issues today.
const URL_OPTS: { require_protocol: boolean; protocols: string[] } = {
  require_protocol: true,
  protocols: ['https'],
}

export class SocialLinkDto {
  @ValidateIf((o, v) => v !== '' && v !== null && v !== undefined)
  @IsUrl(URL_OPTS)
  @IsOptional()
  facebook?: string

  @ValidateIf((o, v) => v !== '' && v !== null && v !== undefined)
  @IsUrl(URL_OPTS)
  @IsOptional()
  twitter?: string

  @ValidateIf((o, v) => v !== '' && v !== null && v !== undefined)
  @IsUrl(URL_OPTS)
  @IsOptional()
  instagram?: string

  @ValidateIf((o, v) => v !== '' && v !== null && v !== undefined)
  @IsUrl(URL_OPTS)
  @IsOptional()
  linkedin?: string
}
