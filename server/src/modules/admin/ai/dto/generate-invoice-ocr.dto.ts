import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator'

export class InvoiceOcrLineItemDto {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  description: string

  @ApiProperty()
  @IsNumber()
  quantity: number

  @ApiProperty()
  @IsNumber()
  unitPrice: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lineTotal?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string
}

export class GenerateInvoiceOcrDto {
  @ApiProperty({ description: 'Serialized invoice file or upload metadata from admin UI' })
  @IsString()
  @MaxLength(2000)
  invoiceSummary: string

  @ApiPropertyOptional({ description: 'Pasted invoice text when no vision image is available' })
  @IsOptional()
  @IsString()
  @MaxLength(12000)
  invoiceText?: string

  @ApiPropertyOptional({ description: 'Public image URL for vision OCR (JPG/PNG)' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2000)
  imageUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimetype?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  useVision?: boolean

  @ApiPropertyOptional({ description: 'Optional PO line context for cross-check hints' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  poContextSummary?: string
}

export class InvoiceOcrResultDto {
  @ApiPropertyOptional()
  invoiceNumber?: string

  @ApiPropertyOptional()
  supplierName?: string

  @ApiPropertyOptional()
  invoiceDate?: string

  @ApiPropertyOptional()
  dueDate?: string

  @ApiPropertyOptional()
  currency?: string

  @ApiPropertyOptional()
  subtotal?: number

  @ApiPropertyOptional()
  taxAmount?: number

  @ApiPropertyOptional()
  totalAmount?: number

  @ApiProperty({ type: [InvoiceOcrLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceOcrLineItemDto)
  lineItems: InvoiceOcrLineItemDto[]

  @ApiProperty()
  extractionNotes: string

  @ApiPropertyOptional()
  visionUsed?: boolean

  @ApiPropertyOptional({ type: [String] })
  unmatchedWarnings?: string[]
}
