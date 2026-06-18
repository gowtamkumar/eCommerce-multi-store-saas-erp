import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

export const TOXICITY_LEVELS = ['none', 'low', 'medium', 'high'] as const
export type ToxicityLevel = (typeof TOXICITY_LEVELS)[number]

export class GenerateReviewAssistDto {
  @ApiProperty({ description: 'Serialized review context from admin UI' })
  @IsString()
  @MaxLength(3000)
  reviewSummary: string

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  reviewerName: string

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  reviewStatus?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  productName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class ReviewAssistResultDto {
  @ApiProperty()
  publicReply: string

  @ApiProperty({ enum: TOXICITY_LEVELS })
  toxicityLevel: ToxicityLevel

  @ApiProperty()
  toxicityReason: string

  @ApiProperty()
  needsAttention: boolean
}
