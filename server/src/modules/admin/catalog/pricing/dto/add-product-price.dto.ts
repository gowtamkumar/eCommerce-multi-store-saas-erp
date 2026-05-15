import { IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from 'class-validator'

export class AddProductPriceDto {
  @IsUUID()
  @IsNotEmpty()
  priceBookId: string

  @IsUUID()
  @IsNotEmpty()
  productId: string

  @IsUUID()
  @IsOptional()
  variantId?: string

  @IsNumber()
  @Min(0)
  price: number

  @IsNumber()
  @Min(1)
  @IsOptional()
  minQuantity?: number
}
