import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export const ABANDONED_CART_MESSAGE_TEMPLATES = [
  'gentle_reminder',
  'incentive',
  'urgency',
  'win_back',
  'general',
] as const
export type AbandonedCartMessageTemplate = (typeof ABANDONED_CART_MESSAGE_TEMPLATES)[number]

export class GenerateAbandonedCartMessageDto {
  @ApiProperty({ description: 'Serialized cart context from admin UI' })
  @IsString()
  @MaxLength(4000)
  cartSummary: string

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  customerName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customerEmail?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  customerPhone?: string

  @ApiPropertyOptional({ enum: ABANDONED_CART_MESSAGE_TEMPLATES })
  @IsOptional()
  @IsIn(ABANDONED_CART_MESSAGE_TEMPLATES)
  messageTemplate?: AbandonedCartMessageTemplate

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  brandName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class AbandonedCartMessageResultDto {
  @ApiProperty()
  emailSubject: string

  @ApiProperty()
  emailBody: string

  @ApiPropertyOptional()
  smsText?: string
}
