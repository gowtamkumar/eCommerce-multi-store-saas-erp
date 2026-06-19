import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateGrnDiscrepancyNotesDto {
  @ApiProperty({ description: 'Serialized GRN receipt context from admin UI' })
  @IsString()
  @MaxLength(5000)
  grnSummary: string

  @ApiProperty({ description: 'Serialized ordered vs received line discrepancies' })
  @IsString()
  @MaxLength(6000)
  discrepancySummary: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  existingNotes?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class GrnDiscrepancyNotesResultDto {
  @ApiProperty()
  discrepancyNotes: string

  @ApiProperty({ type: [String] })
  lineHighlights: string[]

  @ApiProperty()
  supplierFollowUp: string
}
