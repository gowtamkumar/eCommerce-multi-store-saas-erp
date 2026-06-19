import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator'
import { AiChatMessageDto } from './ai-chat.dto'

export class AdminCopilotDto {
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
}

export class AdminCopilotToolCallDto {
  @ApiProperty()
  tool: string

  @ApiPropertyOptional()
  args?: Record<string, unknown>
}

export class AdminCopilotResponseDto {
  @ApiProperty()
  reply: string

  @ApiProperty()
  model: string

  @ApiProperty()
  totalTokens: number

  @ApiProperty({ type: [AdminCopilotToolCallDto] })
  toolsUsed: AdminCopilotToolCallDto[]
}
