import { ProductStatus } from '@/common/enums/product-status.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'

export class ImportProductRowDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  description?: string

  @ApiPropertyOptional({ description: 'Category slug or UUID' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  category?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  keywords?: string
}

export class ImportProductsDto {
  @ApiProperty({ type: [ImportProductRowDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ImportProductRowDto)
  rows: ImportProductRowDto[]

  @ApiPropertyOptional({
    description: 'Queue background AI job to fill missing descriptions after import',
  })
  @IsOptional()
  @IsBoolean()
  generateDescriptions?: boolean
}

export class ImportProductsResultDto {
  @ApiProperty()
  importBatchId: string

  @ApiProperty()
  createdCount: number

  @ApiProperty()
  skippedCount: number

  @ApiProperty({ type: [String] })
  createdProductIds: string[]

  @ApiProperty({ type: [String] })
  pendingDescriptionProductIds: string[]

  @ApiPropertyOptional()
  descriptionJobId?: string | null

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  errors: Array<{ row: number; name?: string; message: string }>
}
