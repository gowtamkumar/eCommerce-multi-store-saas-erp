import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateTaxRuleExplanationDto {
  @ApiProperty({ description: 'Serialized tax rule context from admin UI' })
  @IsString()
  @MaxLength(4000)
  ruleSummary: string

  @ApiPropertyOptional({ description: 'Optional summary of related store tax rules for jurisdiction context' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  relatedRulesSummary?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  existingDraft?: string
}

export class TaxRuleExplanationResultDto {
  @ApiProperty()
  ruleTitle: string

  @ApiProperty()
  explanation: string

  @ApiProperty({ type: [String] })
  applicabilityNotes: string[]

  @ApiProperty({ type: [String] })
  complianceReminders: string[]
}
