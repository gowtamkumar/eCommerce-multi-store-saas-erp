import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateBatchWasteReductionDto {
  @ApiProperty({ description: 'Serialized batch registry stats from admin UI' })
  @IsString()
  @MaxLength(2000)
  statsSummary: string

  @ApiProperty({ description: 'Serialized batch snapshot (expiry risk, quantities)' })
  @IsString()
  @MaxLength(6000)
  batchSummary: string

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

export class BatchWasteReductionResultDto {
  @ApiProperty()
  wasteReductionTips: string

  @ApiProperty({ type: [String] })
  priorityActions: string[]
}
