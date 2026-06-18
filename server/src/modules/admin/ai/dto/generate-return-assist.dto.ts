import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export const RETURN_LETTER_TEMPLATES = [
  'approved',
  'rejected',
  'refunded',
  'received',
  'exchange',
  'pending',
  'general',
] as const
export type ReturnLetterTemplate = (typeof RETURN_LETTER_TEMPLATES)[number]

export class GenerateReturnAssistDto {
  @ApiProperty({ description: 'Serialized return request context from admin UI' })
  @IsString()
  @MaxLength(4000)
  returnSummary: string

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  customerName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customerEmail?: string

  @ApiProperty()
  @IsString()
  @MaxLength(50)
  returnStatus: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  returnType?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  refundMethod?: string

  @ApiPropertyOptional({ enum: RETURN_LETTER_TEMPLATES })
  @IsOptional()
  @IsIn(RETURN_LETTER_TEMPLATES)
  letterTemplate?: ReturnLetterTemplate

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class ReturnAssistResultDto {
  @ApiProperty()
  emailSubject: string

  @ApiProperty()
  emailBody: string
}
