import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateInventoryAnomalyDto {
  @ApiProperty({ description: 'Serialized inventory dashboard stats from admin UI' })
  @IsString()
  @MaxLength(2000)
  statsSummary: string

  @ApiProperty({ description: 'Serialized stock snapshot (products/SKUs at risk)' })
  @IsString()
  @MaxLength(6000)
  stockSummary: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  recentMovementsSummary?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  activeFilter?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class InventoryAnomalyResultDto {
  @ApiProperty()
  narrative: string

  @ApiProperty({ type: [String] })
  anomalyHighlights: string[]
}
