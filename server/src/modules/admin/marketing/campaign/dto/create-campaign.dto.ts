import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator'
import { CampaignType } from '../enums/campaign-type.enum'

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEnum(CampaignType)
  type: CampaignType

  @IsOptional()
  @IsDateString()
  scheduleTime?: string

  // Message content
  @IsOptional()
  @IsString()
  subject?: string

  @IsOptional()
  @IsString()
  htmlContent?: string

  @IsOptional()
  @IsString()
  text?: string

  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  body?: string

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsOptional()
  @IsBoolean()
  targetUsers?: boolean

  @IsOptional()
  @IsBoolean()
  targetSubscribers?: boolean

  @IsOptional()
  @IsBoolean()
  targetLeads?: boolean
}
