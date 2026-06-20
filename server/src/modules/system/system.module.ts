import { Module } from '@nestjs/common'
import { AuditLogModule } from './audit-log/audit-log.module'
import { PlatformModule } from './platform/platform.module'
import { SubscriptionBillingModule } from './subscription-billing/subscription-billing.module'
import { SubscriptionPlanModule } from './subscription-plan/subscription-plan.module'
import { SuperAdminModule } from './super-admin/super-admin.module'
import { OrganizationModule } from './organization/organization.module'
import { PlatformCampaignModule } from './platform-campaign/platform-campaign.module'

@Module({
  imports: [
    AuditLogModule,
    PlatformModule,
    SuperAdminModule,
    SubscriptionPlanModule,
    SubscriptionBillingModule,
    OrganizationModule,
    PlatformCampaignModule,
  ],
  exports: [
    AuditLogModule,
    PlatformModule,
    SuperAdminModule,
    SubscriptionPlanModule,
    SubscriptionBillingModule,
    OrganizationModule,
    PlatformCampaignModule,
  ],
})
export class SystemModule {}
