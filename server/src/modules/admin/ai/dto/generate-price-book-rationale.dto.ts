import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GeneratePriceBookRationaleDto {
  @ApiProperty({ description: 'Serialized price book context from admin UI' })
  @IsString()
  @MaxLength(4000)
  priceBookSummary: string

  @ApiPropertyOptional({ description: 'Other tenant price books for comparison' })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  catalogSummary?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class PriceBookRationaleResultDto {
  @ApiProperty()
  rationaleNotes: string

  @ApiProperty()
  usageGuidance: string
}
