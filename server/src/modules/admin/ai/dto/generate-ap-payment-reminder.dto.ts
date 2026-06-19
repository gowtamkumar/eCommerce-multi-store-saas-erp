import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateApPaymentReminderDto {
  @ApiProperty({ description: 'Serialized AP aging or batch payment context from admin UI' })
  @IsString()
  @MaxLength(5000)
  apSummary: string

  @ApiProperty({ description: 'Serialized unpaid supplier invoice lines pending approval/payment' })
  @IsString()
  @MaxLength(6000)
  invoicesSummary: string

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

export class ApPaymentReminderResultDto {
  @ApiProperty()
  reminderSubject: string

  @ApiProperty()
  reminderBody: string

  @ApiProperty({ type: [String] })
  actionItems: string[]
}
