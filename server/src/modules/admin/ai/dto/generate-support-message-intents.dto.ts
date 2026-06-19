import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator'

export class SupportMessageForIntentDto {
  @ApiProperty()
  @IsUUID()
  messageId: string

  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  text: string
}

export class GenerateSupportMessageIntentsDto {
  @ApiProperty({ type: [SupportMessageForIntentDto] })
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => SupportMessageForIntentDto)
  messages: SupportMessageForIntentDto[]

  @ApiPropertyOptional({ description: 'Brief conversation context for disambiguation' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  conversationSummary?: string
}

export class SupportMessageIntentResultDto {
  @ApiProperty()
  messageId: string

  @ApiProperty({ type: [String] })
  intentTags: string[]
}

export class SupportMessageIntentsResultDto {
  @ApiProperty({ type: [SupportMessageIntentResultDto] })
  messageIntents: SupportMessageIntentResultDto[]
}
