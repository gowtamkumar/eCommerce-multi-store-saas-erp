import { IsEnum, IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { ProductStatus } from '@/common/enums/product-status.enum'

export class FilterProductDto extends PaginationDto {
  /** Full-text search: matches product name, description, SKU, barcode, or variant SKU/barcode */
  @IsOptional()
  @IsString()
  q?: string

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus

  @IsOptional()
  @IsString()
  categoryId?: string

  @IsOptional()
  @IsString()
  brandId?: string

  @IsOptional()
  minPrice?: number

  @IsOptional()
  maxPrice?: number

  @IsOptional()
  @IsString()
  sort?: string

  @IsOptional()
  @IsString()
  attributes?: string // JSON string of selected attributes

  @IsOptional()
  @IsString()
  exclude?: string

  @IsOptional()
  @IsString()
  lowStock?: string

  /** When "true", attach variants to each product (for PO / procurement pickers). */
  @IsOptional()
  @IsString()
  includeVariants?: string
}
