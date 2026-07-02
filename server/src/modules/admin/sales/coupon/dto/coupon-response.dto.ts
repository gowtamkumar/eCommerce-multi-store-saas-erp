import { Expose } from 'class-transformer'
import { DiscountType } from '@/common/enums/discount-type.enum'

export class CouponResponseDto {
  @Expose()
  id: string

  @Expose()
  code: string

  @Expose()
  description: string

  @Expose()
  discountType: DiscountType

  @Expose()
  amount: number

  @Expose()
  minPurchaseAmount: number

  @Expose()
  startDate: Date

  @Expose()
  expiryDate: Date

  @Expose()
  usageLimit: number

  @Expose()
  usedCount: number

  @Expose()
  isActive: boolean

  @Expose()
  storeId: string

  @Expose()
  userId?: string | null

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
