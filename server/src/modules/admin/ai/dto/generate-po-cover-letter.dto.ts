import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GeneratePoCoverLetterDto {
  @ApiProperty({ description: 'Serialized purchase order context from admin UI' })
  @IsString()
  @MaxLength(5000)
  purchaseOrderSummary: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  existingCoverLetter?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class PoCoverLetterResultDto {
  @ApiProperty()
  coverLetter: string

  @ApiProperty()
  termsNotes: string
}
