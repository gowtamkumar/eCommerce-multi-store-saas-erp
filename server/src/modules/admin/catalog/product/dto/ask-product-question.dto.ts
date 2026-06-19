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

export class ProductQaResultDto {
  @ApiProperty()
  answer: string

  @ApiProperty({ type: [String] })
  suggestedFollowUps: string[]
}

export class StorefrontAiStatusDto {
  @ApiProperty()
  productQaAvailable: boolean
}
