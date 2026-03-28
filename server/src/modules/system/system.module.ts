import { Module } from '@nestjs/common'
import { AuditLogModule } from './audit-log/audit-log.module'
import { PlatformModule } from './platform/platform.module'
import { SubscriptionBillingModule } from './subscription-billing/subscription-billing.module'
import { SubscriptionPlanModule } from './subscription-plan/subscription-plan.module'
import { TenantTrafficModule } from './tenant-traffic/tenant-traffic.module'

@Module({
  imports: [
    AuditLogModule,
    PlatformModule,
    TenantTrafficModule,
    SubscriptionPlanModule,
    SubscriptionBillingModule,
  ],
  exports: [
    AuditLogModule,
    PlatformModule,
    TenantTrafficModule,
    SubscriptionPlanModule,
    SubscriptionBillingModule,
  ],
})
export class SystemModule {}
