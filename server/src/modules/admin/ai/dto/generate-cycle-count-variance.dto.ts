import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateCycleCountVarianceDto {
  @ApiProperty({ description: 'Serialized cycle count session context from admin UI' })
  @IsString()
  @MaxLength(2000)
  countSummary: string

  @ApiProperty({ description: 'Serialized variance lines (system vs counted)' })
  @IsString()
  @MaxLength(6000)
  varianceSummary: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  recentMovementsSummary?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class CycleCountVarianceResultDto {
  @ApiProperty()
  narrative: string

  @ApiProperty({ type: [String] })
  varianceHighlights: string[]
}
