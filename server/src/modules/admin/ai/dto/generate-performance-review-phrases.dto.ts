import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export const PERFORMANCE_REVIEW_FOCUS = ['balanced', 'strengths', 'development'] as const
export type PerformanceReviewFocus = (typeof PERFORMANCE_REVIEW_FOCUS)[number]

export class GeneratePerformanceReviewPhrasesDto {
  @ApiProperty({
    description:
      'Minimized review context from admin UI — no employee names, emails, or direct identifiers',
  })
  @IsString()
  @MaxLength(4000)
  reviewSummary: string

  @ApiPropertyOptional({ enum: PERFORMANCE_REVIEW_FOCUS })
  @IsOptional()
  @IsIn(PERFORMANCE_REVIEW_FOCUS)
  focus?: PerformanceReviewFocus

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  existingDraft?: string
}

export class PerformanceReviewPhrasesResultDto {
  @ApiProperty({ type: [String] })
  strengthsPhrases: string[]

  @ApiProperty({ type: [String] })
  developmentPhrases: string[]

  @ApiProperty({ type: [String] })
  summaryPhrases: string[]

  @ApiProperty({ type: [String] })
  usageNotes: string[]
}
