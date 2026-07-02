import { Expose, Type } from 'class-transformer'
import { StoreStatus } from '@/common/enums/store/store-status.enum'
import { StoreDomainResponseDto } from './store-domain-response.dto'
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'
import { SubscriptionPlanResponseDto } from '@/modules/system/subscription-plan/dto/subscription-plan-response.dto'

export class StoreResponseDto {
  @Expose()
  id: string

  @Expose()
  storeName: string

  @Expose()
  subdomain: string

  @Expose()
  @Type(() => StoreDomainResponseDto)
  domains: StoreDomainResponseDto[]

  @Expose()
  status: StoreStatus

  @Expose()
  sslEnabled: boolean

  @Expose()
  subscriptionPlanId: string | null

  @Expose()
  @Type(() => SubscriptionPlanResponseDto)
  subscriptionPlan: SubscriptionPlanResponseDto | null

  @Expose()
  subscriptionStatus: SubscriptionStatus | null

  @Expose()
  subscriptionBillingCycle: SubscriptionBillingCycle | null

  @Expose()
  subscriptionStartsAt: Date | null

  @Expose()
  subscriptionEndsAt: Date | null

  @Expose()
  primaryCustomDomain: string | null

  @Expose()
  isExpired: boolean

  @Expose()
  userId?: string | null

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}

export class StoreOverviewResponseDto {
  @Expose()
  totalStores: number

  @Expose()
  activeStores: number

  @Expose()
  suspendedStores: number

  @Expose()
  archivedStores: number
}
