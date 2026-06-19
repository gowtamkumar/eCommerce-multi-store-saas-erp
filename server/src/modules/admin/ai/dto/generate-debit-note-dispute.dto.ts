import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateDebitNoteDisputeDto {
  @ApiProperty({ description: 'Serialized debit note context from admin UI' })
  @IsString()
  @MaxLength(5000)
  debitNoteSummary: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  existingDisputeLetter?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class DebitNoteDisputeResultDto {
  @ApiProperty()
  disputeLetter: string

  @ApiProperty()
  internalNotes: string
}
