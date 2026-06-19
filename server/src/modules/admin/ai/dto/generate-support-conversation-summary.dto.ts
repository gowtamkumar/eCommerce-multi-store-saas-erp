import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateSupportConversationSummaryDto {
  @ApiProperty({ description: 'Serialized chat transcript from admin UI' })
  @IsString()
  @MaxLength(8000)
  conversationSummary: string

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  customerName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customerEmail?: string

  @ApiPropertyOptional({ description: 'Relevant FAQ entries serialized from admin UI' })
  @IsOptional()
  @IsString()
  @MaxLength(6000)
  faqSummary?: string

  @ApiPropertyOptional({ description: 'Recent or looked-up orders serialized from admin UI' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  orderSummary?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class SupportConversationSummaryResultDto {
  @ApiProperty({ description: 'Short narrative for the next agent taking over the chat' })
  handoffSummary: string

  @ApiProperty({ type: [String] })
  keyPoints: string[]

  @ApiProperty({ type: [String] })
  suggestedNextSteps: string[]

  @ApiProperty({ type: [String] })
  pendingVisitorRequests: string[]
}
