import { Expose } from 'class-transformer';
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum';
import { CustomDomainStatus } from '@/common/enums/tenant/custom-domain-status';
import { SubscriptionStatus } from '@/common/enums/subscription/subscription-status.enum';
import { SubscriptionBillingCycle } from '@/common/enums/subscription/billing-cycle.enum';

export class TenantResponseDto {
  @Expose()
  id: string;

  @Expose()
  storeName: string;

  @Expose()
  subdomain: string;

  @Expose()
  customDomain: string | null;

  @Expose()
  customDomainStatus: CustomDomainStatus;

  @Expose()
  customDomainVerifiedAt: Date | null;

  @Expose()
  status: TenantStatus;

  @Expose()
  sslEnabled: boolean;

  @Expose()
  subscriptionPlanId: string | null;

  @Expose()
  subscriptionBillingCycle: SubscriptionBillingCycle;

  @Expose()
  subscriptionStatus: SubscriptionStatus;

  @Expose()
  subscriptionStartsAt: Date | null;

  @Expose()
  subscriptionEndsAt: Date | null;

  @Expose()
  userId?: string | null;

  @Expose()
  isExpired: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class TenantOverviewResponseDto {
  @Expose()
  totalTenants: number;

  @Expose()
  activeTenants: number;

  @Expose()
  suspendedTenants: number;

  @Expose()
  archivedTenants: number;
}
