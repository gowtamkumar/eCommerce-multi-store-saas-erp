import { Expose } from 'class-transformer'
import { PaymentMethod } from '@/common/enums/payment-method.enum'
import { PaymentStatus } from '@/common/enums/payment-status.enum'

export class PaymentResponseDto {
  @Expose()
  id: string

  @Expose()
  orderId: string

  @Expose()
  userId?: string | null

  @Expose()
  transactionId: string

  @Expose()
  amount: number

  @Expose()
  currency: string

  @Expose()
  method: PaymentMethod

  @Expose()
  status: PaymentStatus

  // gatewayResponse intentionally excluded (may contain sensitive data)

  @Expose()
  storeId: string

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
