import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateArCollectionDraftDto {
  @ApiProperty({ description: 'Serialized customer AR aging context from admin UI' })
  @IsString()
  @MaxLength(5000)
  customerSummary: string

  @ApiProperty({ description: 'Serialized overdue invoice lines from customer ledger' })
  @IsString()
  @MaxLength(6000)
  overdueInvoicesSummary: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  existingDraft?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class ArCollectionDraftResultDto {
  @ApiProperty()
  emailSubject: string

  @ApiProperty()
  emailBody: string

  @ApiProperty()
  internalNotes: string
}
