import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

export class GenerateCouponCodeSuggestionsDto {
  @ApiPropertyOptional({ description: 'e.g. 20% off, free shipping over $50' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  offerSummary?: string

  @ApiPropertyOptional({ description: 'Customer-facing coupon description for context' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @ApiPropertyOptional({ enum: ['percentage', 'fixed', 'free_shipping'] })
  @IsOptional()
  @IsIn(['percentage', 'fixed', 'free_shipping'])
  discountType?: 'percentage' | 'fixed' | 'free_shipping'

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount?: number

  @ApiPropertyOptional({ description: 'Season, campaign, or brand theme' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  theme?: string

  @ApiPropertyOptional({ default: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(3)
  @Max(10)
  count?: number
}

export class CouponCodeSuggestionsResultDto {
  @ApiProperty({ type: [String] })
  suggestions: string[]
}
