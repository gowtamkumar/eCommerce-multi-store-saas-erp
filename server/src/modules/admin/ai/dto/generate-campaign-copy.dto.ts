import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateCampaignCopyDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  campaignName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  audience?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  offerDetails?: string

  @ApiPropertyOptional({ enum: ['email', 'sms', 'both', 'push'] })
  @IsOptional()
  @IsIn(['email', 'sms', 'both', 'push'])
  channel?: 'email' | 'sms' | 'both' | 'push'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class CampaignCopyResultDto {
  @ApiPropertyOptional()
  emailSubject?: string

  @ApiPropertyOptional()
  emailBody?: string

  @ApiPropertyOptional()
  smsText?: string

  @ApiPropertyOptional()
  pushTitle?: string

  @ApiPropertyOptional()
  pushBody?: string
}
