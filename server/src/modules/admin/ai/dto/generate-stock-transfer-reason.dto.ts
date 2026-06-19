import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateStockTransferReasonDto {
  @ApiProperty({ description: 'Serialized stock transfer context from admin UI' })
  @IsString()
  @MaxLength(5000)
  transferSummary: string

  @ApiPropertyOptional({ description: 'Existing remarks on the document, if any' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  existingRemarks?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class StockTransferReasonResultDto {
  @ApiProperty()
  reasonNotes: string

  @ApiProperty()
  auditSummary: string
}
