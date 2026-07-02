import { Expose } from 'class-transformer'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'

export class SubscriptionPlanResponseDto {
  @Expose()
  id: string

  @Expose()
  name: string

  @Expose()
  description: string | null

  @Expose()
  monthlyPrice: number

  @Expose()
  yearlyPrice: number

  @Expose()
  billingCycle: SubscriptionBillingCycle

  @Expose()
  features: string[]

  @Expose()
  isActive: boolean

  @Expose()
  isPopular: boolean

  @Expose()
  trialPeriodDays: number

  @Expose()
  code: string

  @Expose()
  currency: string

  @Expose()
  maxBranches: number

  @Expose()
  maxWarehouses: number

  @Expose()
  maxStaffUsers: number

  @Expose()
  maxProducts: number

  @Expose()
  maxMonthlyOrders: number

  @Expose()
  maxStorageMb: number

  @Expose()
  stripePriceIdMonthly: string | null

  @Expose()
  stripePriceIdYearly: string | null

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
