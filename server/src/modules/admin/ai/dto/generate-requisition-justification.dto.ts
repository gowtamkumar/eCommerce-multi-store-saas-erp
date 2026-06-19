import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateRequisitionJustificationDto {
  @ApiProperty({ description: 'Serialized purchase requisition context from admin UI' })
  @IsString()
  @MaxLength(5000)
  requisitionSummary: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  existingJustification?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class RequisitionJustificationResultDto {
  @ApiProperty()
  justificationText: string

  @ApiProperty({ type: [String] })
  lineNotes: string[]
}
