import { Expose } from 'class-transformer'
import { PromotionType } from '../enums/promotion-type.enum'
import { PromotionTargetType } from '../enums/promotion-target-type.enum'

export class PromotionResponseDto {
  @Expose()
  id: string

  @Expose()
  name: string

  @Expose()
  slug: string

  @Expose()
  description: string

  @Expose()
  promotionType: PromotionType

  @Expose()
  value: number

  @Expose()
  targetType: PromotionTargetType

  @Expose()
  targetId: string

  @Expose()
  minOrderValue: number

  @Expose()
  startDate: Date

  @Expose()
  endDate: Date

  @Expose()
  isActive: boolean

  @Expose()
  tenantId: string

  @Expose()
  userId?: string | null

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
