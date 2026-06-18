import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export const LEAD_FOLLOW_UP_INTENTS = ['welcome', 'follow_up', 'nurture', 'conversion'] as const
export type LeadFollowUpIntent = (typeof LEAD_FOLLOW_UP_INTENTS)[number]

export class GenerateLeadFollowUpDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  leadName: string

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  leadEmail: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string

  @ApiPropertyOptional({ enum: LEAD_FOLLOW_UP_INTENTS })
  @IsOptional()
  @IsIn(LEAD_FOLLOW_UP_INTENTS)
  intent?: LeadFollowUpIntent

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

export class LeadFollowUpResultDto {
  @ApiProperty()
  emailSubject: string

  @ApiProperty()
  emailBody: string

  @ApiPropertyOptional()
  smsText?: string
}
