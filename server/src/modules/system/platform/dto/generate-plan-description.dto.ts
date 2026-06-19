import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator'

export class GeneratePlanDescriptionDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  planName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyPrice?: number

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  yearlyPrice?: number

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  trialPeriodDays?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean

  @ApiPropertyOptional({ type: [String], description: 'Feature slugs included in this tier' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  existingDescription?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string

  @ApiPropertyOptional({ description: 'Human-readable quota summary, e.g. "3 branches, 1000 products"' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  quotaSummary?: string
}

export class PlanDescriptionResultDto {
  @ApiProperty()
  description: string
}
