import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { SubscriptionPlanModule } from '@/modules/system/subscription-plan/subscription-plan.module'
import { Module } from '@nestjs/common'
import { OnboardController } from './public-tenant.controller'
import { TenantController } from './tenant.controller'
import { TenantService } from './tenant.service'

@Module({
  imports: [
    SettingsModule,
    MailModule,
    SubscriptionPlanModule,
  ],
  controllers: [TenantController, OnboardController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
