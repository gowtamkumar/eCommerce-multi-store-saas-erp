import { Expose, Type } from 'class-transformer'
import { OrderStatus } from '@/common/enums/order-status.enum'
import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'

export class OrderItemResponseDto {
  @Expose()
  id: string

  @Expose()
  productId: string

  @Expose()
  variantId: string

  @Expose()
  quantity: number

  @Expose()
  unitPrice: number

  @Expose()
  totalPrice: number

  @Expose()
  productName: string

  @Expose()
  variantName: string
}

export class OrderResponseDto {
  @Expose()
  id: string

  @Expose()
  customerName: string

  @Expose()
  customerEmail: string

  @Expose()
  customerPhone: string

  @Expose()
  address: string

  @Expose()
  shippingAddressId: string

  @Expose()
  totalAmount: number

  @Expose()
  shippingFee: number

  @Expose()
  currency: string

  @Expose()
  currencyRate: number

  @Expose()
  status: OrderStatus

  @Expose()
  paymentMethod: PaymentMethod

  @Expose()
  paymentStatus: PaymentStatus

  @Expose()
  transactionId: string

  @Expose()
  orderNotes: string

  @Expose()
  trackingId: string

  @Expose()
  courierStatus: string

  @Expose()
  appliedCoupon: string

  @Expose()
  couponDiscountAmount: number

  @Expose()
  taxAmount: number

  @Expose()
  deliveryZone: string

  @Expose()
  userId: string

  @Expose()
  tenantId: string

  @Expose()
  @Type(() => OrderItemResponseDto)
  items: OrderItemResponseDto[]

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
