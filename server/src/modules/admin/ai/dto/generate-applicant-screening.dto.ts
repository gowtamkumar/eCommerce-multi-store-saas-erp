import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsNumber,
  Min,
  Max,
  ArrayMaxSize,
} from 'class-validator'

export enum ApplicantScreeningStage {
  INITIAL = 'initial',
  TECHNICAL = 'technical',
  CULTURAL_FIT = 'cultural_fit',
  FINAL = 'final',
}

export class GenerateApplicantScreeningDto {
  @ApiProperty({
    description:
      'Plain-text job description or role summary — responsibilities, required skills, team context. Sensitive applicant PII must NOT be included.',
    example:
      'Senior backend engineer for an e-commerce platform team. Must have 5+ years Node.js, experience with PostgreSQL and microservices. Remote-first, collaborative culture.',
  })
  @IsString()
  @MinLength(20)
  @MaxLength(3000)
  jobSummary: string

  @ApiPropertyOptional({
    enum: ApplicantScreeningStage,
    description:
      'Interview stage to target question depth. Defaults to initial screening.',
    example: ApplicantScreeningStage.INITIAL,
  })
  @IsOptional()
  @IsEnum(ApplicantScreeningStage)
  stage?: ApplicantScreeningStage

  @ApiPropertyOptional({
    description: 'Number of screening questions to generate (5–15). Default: 8.',
    minimum: 5,
    maximum: 15,
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(15)
  count?: number

  @ApiPropertyOptional({
    description:
      'Specific competencies or skills to focus on (max 8). e.g. ["System design", "Conflict resolution"]',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(8)
  focusAreas?: string[]

  @ApiPropertyOptional({
    description: 'Preferred question tone. Default: behavioral (STAR method).',
    example: 'behavioral',
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  tone?: string
}

export class ScreeningQuestionDto {
  @ApiProperty({ description: 'The interview question' })
  question: string

  @ApiProperty({
    description: 'Category of the question (e.g. Technical, Behavioral, Culture Fit)',
  })
  category: string

  @ApiPropertyOptional({
    description: 'Brief guidance for the interviewer on what a strong answer looks like',
  })
  interviewerGuide?: string
}

export class ApplicantScreeningResultDto {
  @ApiProperty({ type: [ScreeningQuestionDto], description: 'Generated screening questions' })
  questions: ScreeningQuestionDto[]

  @ApiProperty({ description: 'Suggested interview duration in minutes' })
  suggestedDurationMinutes: number

  @ApiProperty({
    type: [String],
    description: 'Compliance reminders for interviewers (e.g. avoid protected characteristics)',
  })
  complianceNotes: string[]
}
