import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateSupplierProfileSummaryDto {
  @ApiProperty({ description: 'Serialized supplier profile from admin UI' })
  @IsString()
  @MaxLength(5000)
  supplierSummary: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  existingSummary?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class SupplierProfileSummaryResultDto {
  @ApiProperty()
  profileSummary: string

  @ApiProperty({ type: [String] })
  supplierTags: string[]
}
