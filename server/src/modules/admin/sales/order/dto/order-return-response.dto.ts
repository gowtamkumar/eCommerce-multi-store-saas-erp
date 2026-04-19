import { Expose } from 'class-transformer'
import { ReturnStatus } from '@/common/enums/return-status.enum'

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
  reason: string

  @Expose()
  adminComment: string

  @Expose()
  refundAmount: number

  @Expose()
  items: any[]

  @Expose()
  tenantId: string

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
