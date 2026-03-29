import { Expose, Type } from 'class-transformer'
import { IsDate } from 'class-validator'
import { ProductStatus } from '@/common/enums/product-status.enum'
import { DiscountType } from '@/common/enums/discount-type.enum'

export class ProductAttributeResponseDto {
  @Expose()
  id: string

  @Expose()
  name: string

  @Expose()
  values: string[]

  @Expose()
  @IsDate()
  createdAt: Date

  @Expose()
  updatedAt: Date
}

export class ProductVariantResponseDto {
  @Expose()
  id: string

  @Expose()
  sku: string

  @Expose()
  price: number

  @Expose()
  stock: number

  @Expose()
  lowStockThreshold: number

  @Expose()
  images: string[]

  @Expose()
  combination: Record<string, string>

  @Expose()
  @IsDate()
  createdAt: Date

  @Expose()
  updatedAt: Date
}

export class ProductResponseDto {
  @Expose()
  id: string

  @Expose()
  name: string

  @Expose()
  slug: string

  @Expose()
  description: string

  @Expose()
  shortDescription: string

  @Expose()
  price: number

  @Expose()
  isReview: boolean

  @Expose()
  discountAmount: number

  @Expose()
  discountType: DiscountType

  @Expose()
  taxRate: number

  @Expose()
  images: string[]

  @Expose()
  stock: number

  @Expose()
  lowStockThreshold: number

  @Expose()
  status: ProductStatus

  @Expose()
  categoryId: string

  @Expose()
  brandId: string

  @Expose()
  landingPageId: string

  @Expose()
  faqSource: string

  @Expose()
  faqIds: string[]

  @Expose()
  supplierId: string

  @Expose()
  metaTitle: string

  @Expose()
  metaDescription: string

  @Expose()
  ogImage: string

  @Expose()
  isNew: boolean

  @Expose()
  isHot: boolean

  @Expose()
  isSale: boolean

  @Expose()
  @Type(() => ProductAttributeResponseDto)
  attributes: ProductAttributeResponseDto[]

  @Expose()
  @Type(() => ProductVariantResponseDto)
  variants: ProductVariantResponseDto[]

  @Expose()
  applicablePromotions?: any[]

  @Expose()
  @IsDate()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
