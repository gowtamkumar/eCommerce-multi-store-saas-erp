import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateExpenseCategoryDto {
  @ApiProperty({ description: 'Serialized expense context from admin UI (title, description, amount, etc.)' })
  @IsString()
  @MaxLength(4000)
  expenseSummary: string

  @ApiPropertyOptional({ description: 'Currently selected category value, if any' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  currentCategory?: string
}

export class ExpenseCategorySuggestResultDto {
  @ApiProperty({ description: 'Suggested expense category slug' })
  suggestedCategory: string

  @ApiProperty({ enum: ['high', 'medium', 'low'] })
  confidence: 'high' | 'medium' | 'low'

  @ApiProperty()
  reasoning: string
}
