import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateRecruitmentJobCopyDto {
  @ApiProperty({ description: 'Serialized job posting context from admin UI' })
  @IsString()
  @MaxLength(5000)
  jobSummary: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  existingDraft?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class RecruitmentJobCopyResultDto {
  @ApiProperty()
  jobDescription: string

  @ApiProperty({ type: [String] })
  requirements: string[]

  @ApiProperty({ type: [String] })
  screeningQuestions: string[]
}
