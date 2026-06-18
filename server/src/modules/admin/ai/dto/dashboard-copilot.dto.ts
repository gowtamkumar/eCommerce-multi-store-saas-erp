import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator'
import { AiChatMessageDto } from './ai-chat.dto'

export const DASHBOARD_COPILOT_PERIODS = ['day', 'week', 'month'] as const
export type DashboardCopilotPeriod = (typeof DASHBOARD_COPILOT_PERIODS)[number]

export class DashboardCopilotDto {
  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  message: string

  @ApiPropertyOptional({ type: [AiChatMessageDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => AiChatMessageDto)
  history?: AiChatMessageDto[]

  @ApiPropertyOptional({ enum: DASHBOARD_COPILOT_PERIODS })
  @IsOptional()
  @IsIn(DASHBOARD_COPILOT_PERIODS)
  period?: DashboardCopilotPeriod
}
