import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export const LOYALTY_COPY_CONTEXTS = ['program', 'rule'] as const
export type LoyaltyCopyContext = (typeof LOYALTY_COPY_CONTEXTS)[number]

export class GenerateLoyaltyCopyDto {
  @ApiProperty({ enum: LOYALTY_COPY_CONTEXTS })
  @IsIn(LOYALTY_COPY_CONTEXTS)
  context: LoyaltyCopyContext

  @ApiPropertyOptional({ description: 'Program rules summary or rule parameters' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  offerSummary?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  ruleType?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class LoyaltyProgramCopyResultDto {
  @ApiProperty()
  programDescription: string

  @ApiProperty()
  referralMessage: string
}

export class LoyaltyRuleCopyResultDto {
  @ApiProperty()
  name: string
}
