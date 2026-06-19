import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateReportExecutiveSummaryDto {
  @ApiProperty({ description: 'Report type slug e.g. profit-loss, finance-summary, cash-flow' })
  @IsString()
  @MaxLength(50)
  reportType: string

  @ApiProperty({ description: 'Serialized report metrics from admin UI (numbers from DB only)' })
  @IsString()
  @MaxLength(8000)
  reportSummary: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  existingDraft?: string
}

export class ReportExecutiveSummaryResultDto {
  @ApiProperty()
  headline: string

  @ApiProperty()
  executiveSummary: string

  @ApiProperty({ type: [String] })
  highlights: string[]

  @ApiProperty({ type: [String] })
  watchItems: string[]
}
