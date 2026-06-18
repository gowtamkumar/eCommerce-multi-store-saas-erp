import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export const ORDER_ASSIST_CONTEXTS = ['status', 'email'] as const
export type OrderAssistContext = (typeof ORDER_ASSIST_CONTEXTS)[number]

export const ORDER_EMAIL_TEMPLATES = [
  'status_update',
  'shipped',
  'delay',
  'cancellation',
  'payment_issue',
  'general',
] as const
export type OrderEmailTemplate = (typeof ORDER_EMAIL_TEMPLATES)[number]

export class GenerateOrderAssistDto {
  @ApiProperty({ enum: ORDER_ASSIST_CONTEXTS })
  @IsIn(ORDER_ASSIST_CONTEXTS)
  context: OrderAssistContext

  @ApiProperty({ description: 'Serialized order context from admin UI' })
  @IsString()
  @MaxLength(4000)
  orderSummary: string

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
  orderStatus: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentStatus?: string

  @ApiPropertyOptional({ enum: ORDER_EMAIL_TEMPLATES })
  @IsOptional()
  @IsIn(ORDER_EMAIL_TEMPLATES)
  emailTemplate?: OrderEmailTemplate

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class OrderAssistResultDto {
  @ApiPropertyOptional()
  explanation?: string

  @ApiPropertyOptional()
  emailSubject?: string

  @ApiPropertyOptional()
  emailBody?: string
}
