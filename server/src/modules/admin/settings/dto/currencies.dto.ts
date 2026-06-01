import { IsNumber, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator'

// ISO-4217 codes are exactly three uppercase letters.
const ISO_4217_RE = /^[A-Z]{3}$/

export class CurrenciesDto {
  @IsString()
  @Matches(ISO_4217_RE, { message: 'code must be a 3-letter ISO-4217 currency code' })
  @IsOptional()
  code?: string

  @IsString()
  @Length(1, 8)
  @IsOptional()
  symbol?: string

  // Positive and bounded so a typo can't accidentally zero out every storefront
  // total. 1e9 is well above any plausible FX rate in practice.
  @IsNumber()
  @Min(0.000001)
  @Max(1e9)
  @IsOptional()
  rate?: number

  @IsString()
  @Length(1, 80)
  @IsOptional()
  name?: string
}
