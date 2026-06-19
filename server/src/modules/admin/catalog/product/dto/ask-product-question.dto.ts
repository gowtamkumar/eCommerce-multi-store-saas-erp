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

export class ProductQaMessageDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant'

  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  content: string
}

export class AskProductQuestionDto {
  @ApiProperty({ description: 'Shopper question about the product' })
  @IsString()
  @MaxLength(500)
  question: string

  @ApiPropertyOptional({
    description: 'Recent Q&A turns for follow-up questions (max 6 messages)',
    type: [ProductQaMessageDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => ProductQaMessageDto)
  conversationHistory?: ProductQaMessageDto[]
}

export class StorefrontAssistantChatDto {
  @ApiProperty({ description: 'Shopper message to the shopping assistant' })
  @IsString()
  @MaxLength(500)
  message: string

  @ApiPropertyOptional({
    description: 'Recent chat turns (max 8 messages)',
    type: [ProductQaMessageDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => ProductQaMessageDto)
  conversationHistory?: ProductQaMessageDto[]

  @ApiPropertyOptional({ description: 'Store brand name for friendlier replies' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  brandName?: string
}

export class StorefrontAssistantProductLinkDto {
  @ApiProperty()
  name: string

  @ApiProperty()
  slug: string
}

export class ProductQaResultDto {
  @ApiProperty()
  answer: string

  @ApiProperty({ type: [String] })
  suggestedFollowUps: string[]
}

export class StorefrontAssistantChatResultDto {
  @ApiProperty()
  answer: string

  @ApiProperty({ type: [String] })
  suggestedFollowUps: string[]

  @ApiProperty({ type: [StorefrontAssistantProductLinkDto] })
  productLinks: StorefrontAssistantProductLinkDto[]

  @ApiProperty({
    description:
      'When true, the client should offer a prominent handoff to human live chat',
  })
  suggestLiveChatHandoff: boolean
}

export class StorefrontAiStatusDto {
  @ApiProperty()
  productQaAvailable: boolean

  @ApiProperty()
  shoppingAssistantAvailable: boolean

  @ApiProperty()
  semanticSearchAvailable: boolean

  @ApiProperty()
  shoppingAssistantEnabled: boolean

  @ApiProperty()
  productQaEnabled: boolean

  @ApiProperty()
  semanticSearchEnabled: boolean
}
