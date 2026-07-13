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

export class ProductFaqResultDto {
  @ApiProperty()
  question: string

  @ApiProperty()
  answer: string

  @ApiProperty()
  order: number
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

  @ApiPropertyOptional()
  sku?: string

  @ApiPropertyOptional()
  barcode?: string

  @ApiPropertyOptional()
  price?: number

  @ApiPropertyOptional()
  wholesalePrice?: number

  @ApiPropertyOptional()
  averageCost?: number

  @ApiPropertyOptional()
  lowStockThreshold?: number

  @ApiPropertyOptional()
  suggestedCategory?: string

  @ApiPropertyOptional()
  suggestedBrand?: string

  @ApiPropertyOptional({ type: [ProductFaqResultDto] })
  faqs?: ProductFaqResultDto[]
}
