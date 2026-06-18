import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateSupportReplyDto {
  @ApiProperty({ description: 'Serialized recent chat transcript from admin UI' })
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

export class SupportReplyResultDto {
  @ApiProperty()
  suggestedReply: string
}
