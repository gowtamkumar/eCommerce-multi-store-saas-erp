import { Expose } from 'class-transformer'
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'

export class CurrentSubscriptionResponseDto {
  @Expose()
  planName: string

  @Expose()
  status: SubscriptionStatus

  @Expose()
  startsAt: Date | null

  @Expose()
  endsAt: Date | null

  @Expose()
  billingCycle: SubscriptionBillingCycle | null

  @Expose()
  isExpired: boolean
}
