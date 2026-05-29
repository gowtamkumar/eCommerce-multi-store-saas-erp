import { Expose } from 'class-transformer'
import { ReturnStatus } from '@/common/enums/return-status.enum'
import { RefundMethod, ReturnType } from '@/common/enums/refund-method.enum'

export class OrderReturnResponseDto {
  @Expose()
  id: string

  @Expose()
  orderId: string

  @Expose()
  userId?: string | null

  @Expose()
  status: ReturnStatus

  @Expose()
  returnType: ReturnType

  @Expose()
  refundMethod: RefundMethod

  @Expose()
  reason: string

  @Expose()
  adminComment: string

  @Expose()
  refundAmount: number

  @Expose()
  items: any[]

  @Expose()
  exchangeOrderId: string | null

  @Expose()
  receivedAt: Date | null

  @Expose()
  tenantId: string

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
