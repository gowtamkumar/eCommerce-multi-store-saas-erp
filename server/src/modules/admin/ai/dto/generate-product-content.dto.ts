import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateProductContentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  productName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  category?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  keywords?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  existingDescription?: string

  @ApiPropertyOptional({ description: 'Tone: professional, friendly, luxury, etc.' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class ProductContentResultDto {
  @ApiProperty()
  title: string

  @ApiProperty()
  shortDescription: string

  @ApiProperty()
  description: string

  @ApiProperty()
  seoTitle: string

  @ApiProperty()
  seoDescription: string

  @ApiProperty({ type: [String] })
  tags: string[]
}
