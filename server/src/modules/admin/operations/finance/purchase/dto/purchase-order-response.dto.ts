import { Expose } from 'class-transformer'
import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum'
import { PurchaseOrderPaymentStatus } from '../enums/purchase-order-payment-status.enum'

export class PurchaseOrderResponseDto {
  @Expose()
  id: string

  @Expose()
  referenceNumber: string

  @Expose()
  supplierId: string

  @Expose()
  status: PurchaseOrderStatus

  @Expose()
  totalAmount: number

  @Expose()
  paymentStatus: PurchaseOrderPaymentStatus

  @Expose()
  paidAmount: number

  @Expose()
  items: any[]

  @Expose()
  storeId: string

  @Expose()
  userId?: string | null

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
