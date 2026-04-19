import { Expose, Type } from 'class-transformer'

export class CartItemProductResponseDto {
  @Expose()
  id: string

  @Expose()
  name: string

  @Expose()
  image: string | null
}

export class CartItemVariantAttributeResponseDto {
  @Expose()
  name: string

  @Expose()
  value: string
}

export class CartItemVariantResponseDto {
  @Expose()
  id: string

  @Expose()
  sku: string

  @Expose()
  @Type(() => CartItemVariantAttributeResponseDto)
  attributes: CartItemVariantAttributeResponseDto[]
}

export class CartItemPricingResponseDto {
  @Expose()
  base_price: number

  @Expose()
  discount: number

  @Expose()
  tax: number

  @Expose()
  final_price: number
}

export class CartItemResponseDto {
  @Expose()
  cart_item_id: string

  @Expose()
  @Type(() => CartItemProductResponseDto)
  product: CartItemProductResponseDto

  @Expose()
  @Type(() => CartItemVariantResponseDto)
  variant: CartItemVariantResponseDto | null

  @Expose()
  @Type(() => CartItemPricingResponseDto)
  pricing: CartItemPricingResponseDto

  @Expose()
  quantity: number

  @Expose()
  line_total: number

  @Expose()
  stock_status: string
}

export class CartSummaryResponseDto {
  @Expose()
  subtotal: number

  @Expose()
  offer_discount: number

  @Expose()
  coupon_discount: number

  @Expose()
  tax: number

  @Expose()
  payable: number

  @Expose()
  is_free_shipping: boolean
}

export class CartResponseDto {
  @Expose()
  cart_id: string

  @Expose()
  currency: string

  @Expose()
  @Type(() => CartItemResponseDto)
  items: CartItemResponseDto[]

  @Expose()
  @Type(() => CartSummaryResponseDto)
  summary: CartSummaryResponseDto

  @Expose()
  appliedCouponCode: string | null
}
