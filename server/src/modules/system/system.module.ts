import { Module } from '@nestjs/common'
import { AuditLogModule } from './audit-log/audit-log.module'
import { PlatformModule } from './platform/platform.module'
import { SubscriptionPlanModule } from './subscription-plan/subscription-plan.module'
import { SuperAdminModule } from './super-admin/super-admin.module'
import { SubscriptionBillingModule } from './subscription-billing/subscription-billing.module'

@Module({
  imports: [
    AuditLogModule,
    PlatformModule,
    SuperAdminModule,
    SubscriptionPlanModule,
    SubscriptionBillingModule,
  ],
  exports: [
    AuditLogModule,
    PlatformModule,
    SuperAdminModule,
    SubscriptionPlanModule,
    SubscriptionBillingModule,
  ],
})
export class SystemModule {}
