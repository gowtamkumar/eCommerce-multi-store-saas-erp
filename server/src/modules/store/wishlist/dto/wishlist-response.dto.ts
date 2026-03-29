import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'

export class WishlistResponseDto {
  @Expose()
  @ApiProperty()
  id: string

  @Expose()
  @ApiProperty()
  productId: string

  @Expose()
  @ApiProperty()
  @Type(() => Object) // Simplified for the response, could be ProductResponseDto
  product: ProductEntity

  @Expose()
  @ApiProperty()
  createdAt: Date
}
