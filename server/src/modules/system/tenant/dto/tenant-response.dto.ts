import { Expose, Type } from 'class-transformer'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { TenantDomainResponseDto } from './tenant-domain-response.dto'
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum'
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum'
import { SubscriptionPlanResponseDto } from '@/modules/system/subscription-plan/dto/subscription-plan-response.dto'

export class TenantResponseDto {
  @Expose()
  id: string

  @Expose()
  storeName: string

  @Expose()
  subdomain: string

  @Expose()
  @Type(() => TenantDomainResponseDto)
  domains: TenantDomainResponseDto[]

  @Expose()
  status: TenantStatus

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

export class TenantOverviewResponseDto {
  @Expose()
  totalTenants: number

  @Expose()
  activeTenants: number

  @Expose()
  suspendedTenants: number

  @Expose()
  archivedTenants: number
}
