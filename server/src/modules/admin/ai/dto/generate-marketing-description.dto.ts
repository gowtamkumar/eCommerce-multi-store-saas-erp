import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateMarketingDescriptionDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name: string

  @ApiPropertyOptional({ description: 'e.g. 20% off, free shipping over $50' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  offerSummary?: string

  @ApiPropertyOptional({ enum: ['coupon', 'promotion'] })
  @IsOptional()
  @IsIn(['coupon', 'promotion'])
  context?: 'coupon' | 'promotion'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class MarketingDescriptionResultDto {
  @ApiProperty()
  description: string
}
