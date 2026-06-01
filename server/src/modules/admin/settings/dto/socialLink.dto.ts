import { IsOptional, IsUrl } from 'class-validator'

// Restricting protocols to https keeps storefront social links safe to embed
// in <a href> attributes and matches what every major platform issues today.
const URL_OPTS: { require_protocol: boolean; protocols: string[] } = {
  require_protocol: true,
  protocols: ['https'],
}

export class SocialLinkDto {
  @IsUrl(URL_OPTS)
  @IsOptional()
  facebook?: string

  @IsUrl(URL_OPTS)
  @IsOptional()
  twitter?: string

  @IsUrl(URL_OPTS)
  @IsOptional()
  instagram?: string

  @IsUrl(URL_OPTS)
  @IsOptional()
  linkedin?: string
}
