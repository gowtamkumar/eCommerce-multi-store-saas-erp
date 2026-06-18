import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateFaqDto {
  @ApiProperty({ description: 'Topic or question hint for the FAQ entry' })
  @IsString()
  @MaxLength(300)
  topic: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class FaqContentResultDto {
  @ApiProperty()
  question: string

  @ApiProperty()
  answer: string
}
