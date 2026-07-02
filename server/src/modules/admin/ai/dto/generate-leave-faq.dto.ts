import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsOptional, IsString, MaxLength, MinLength, ArrayMaxSize } from 'class-validator'

export class GenerateLeaveFaqDto {
  @ApiProperty({
    description:
      'Plain-text summary of the leave policy (types, accrual rules, eligibility, approval flow, carryover, blackout dates, etc.)',
    example:
      'Annual leave: 20 days/year, accrues monthly, max 5 days carry-over. Sick leave: 10 days/year, no carry-over. Maternity: 16 weeks fully paid. All requests via HRMS portal, 2-week advance notice required.',
  })
  @IsString()
  @MinLength(20)
  @MaxLength(4000)
  policySummary: string

  @ApiPropertyOptional({
    description: 'Seed questions to include (max 10). The AI will also generate additional FAQs.',
    type: [String],
    example: ['Can I carry over unused annual leave?', 'How do I apply for maternity leave?'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  seedQuestions?: string[]

  @ApiPropertyOptional({
    description: 'Target audience for the FAQ (e.g. "all employees", "managers", "contractors")',
    example: 'all employees',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  audience?: string

  @ApiPropertyOptional({
    description: 'Company / store name to personalise the FAQ heading',
    example: 'Acme Retail',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  companyName?: string
}

export class LeaveFaqItemDto {
  @ApiProperty({ description: 'The frequently-asked question' })
  question: string

  @ApiProperty({ description: 'Plain-text answer derived from the policy' })
  answer: string
}

export class LeaveFaqResultDto {
  @ApiProperty({ type: [LeaveFaqItemDto], description: 'Generated FAQ items' })
  faqs: LeaveFaqItemDto[]

  @ApiProperty({ description: 'Suggested title for the FAQ document' })
  title: string

  @ApiPropertyOptional({ description: 'Optional intro paragraph' })
  intro?: string

  @ApiProperty({
    type: [String],
    description: 'Compliance / HR reviewer reminders before publishing',
  })
  reviewNotes: string[]
}
