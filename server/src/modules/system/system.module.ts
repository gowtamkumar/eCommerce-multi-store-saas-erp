import { Module } from '@nestjs/common';
import { AuditLogModule } from './audit-log/audit-log.module';
import { PlatformModule } from './platform/platform.module';
import { SubscriptionPlanModule } from './subscription-plan/subscription-plan.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { TrackingModule } from './tracking/tracking.module';


@Module({
  imports: [
    AuditLogModule,
    PlatformModule,
    SuperAdminModule,
    SubscriptionPlanModule,
    TrackingModule
  ],
  exports: [
    AuditLogModule,
    PlatformModule,
    SuperAdminModule,
    SubscriptionPlanModule,
    TrackingModule
  ]
})
export class SystemModule { }
