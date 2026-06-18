import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export class GenerateCatalogContentDto {
  @ApiProperty({ enum: ['category', 'brand'] })
  @IsIn(['category', 'brand'])
  entityType: 'category' | 'brand'

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name: string

  @ApiPropertyOptional({ description: 'Parent category name (categories only)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  context?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  keywords?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  existingDescription?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tone?: string
}

export class CatalogContentResultDto {
  @ApiProperty()
  description: string

  @ApiProperty()
  seoTitle: string

  @ApiProperty()
  seoDescription: string
}
