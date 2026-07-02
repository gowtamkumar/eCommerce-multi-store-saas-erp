import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateSupportTicketSummaryDto {
  @ApiProperty({ description: 'Support conversation transcript or ticket notes' })
  @IsString()
  @MaxLength(12000)
  conversationText: string

  @ApiPropertyOptional({ description: 'Store/store context (name, plan, status — no secrets)' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  storeContext?: string

  @ApiPropertyOptional({ description: 'Related order or issue reference' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  issueSummary?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class SupportTicketSummaryResultDto {
  @ApiProperty()
  ticketSummary: string

  @ApiProperty({ type: [String] })
  customerIntentTags: string[]

  @ApiProperty({ type: [String] })
  suggestedNextSteps: string[]

  @ApiProperty()
  escalationHint: string
}
