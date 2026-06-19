import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateDemandForecastDto {
  @ApiProperty({ description: 'Serialized sales velocity and stock snapshot for heuristic forecast' })
  @IsString()
  @MaxLength(12000)
  salesSummary: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class DemandForecastSuggestionDto {
  @ApiProperty()
  productName: string

  @ApiPropertyOptional()
  sku?: string

  @ApiProperty()
  currentStock: number

  @ApiProperty()
  recentSoldQty: number

  @ApiProperty()
  suggestedReorderQty: number

  @ApiProperty()
  rationale: string
}

export class DemandForecastResultDto {
  @ApiProperty()
  summary: string

  @ApiProperty({ type: [DemandForecastSuggestionDto] })
  suggestions: DemandForecastSuggestionDto[]

  @ApiProperty()
  disclaimer: string
}
