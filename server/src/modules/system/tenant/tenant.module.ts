import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { SubscriptionPlanModule } from '@/modules/system/subscription-plan/subscription-plan.module'
import { OnboardController } from './public-tenant.controller'
import { TenantController } from './tenant.controller'
import { TenantService } from './tenant.service'
import { TenantRepository } from './tenant.repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TenantEntity } from './entities/tenant.entity'
import { UserModule } from '@/modules/admin/core/user/user.module'
import { Global, Module } from '@nestjs/common'
import { RbacModule } from '@/modules/admin/core/rbac/rbac.module'

import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([TenantEntity]),
    SettingsModule,
    MailModule,
    SubscriptionPlanModule,
    UserModule,
    RbacModule,
    NotificationModule,
  ],
  controllers: [TenantController, OnboardController],
  providers: [TenantService, TenantRepository],
  exports: [TenantService, TenantRepository],
})
export class TenantModule {}
