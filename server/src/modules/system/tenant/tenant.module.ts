import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { SubscriptionPlanModule } from '@/modules/system/subscription-plan/subscription-plan.module'
import { TenantEntity } from './entities/tenant.entity'
import { OnboardController } from './public-tenant.controller'
import { TenantController } from './tenant.controller'
import { TenantService } from './tenant.service'
import { TenantRepository } from './tenant.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    SettingsModule,
    MailModule,
    SubscriptionPlanModule,
  ],
  controllers: [TenantController, OnboardController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
