import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MailModule } from 'src/modules/admin/others/mail/mail.module'
import { UserEntity } from '../../admin/core/user/entities/user.entity'
import { SettingsModule } from '../../admin/settings/settings.module'
import { SubscriptionPlanModule } from '../../system/subscription-plan/subscription-plan.module'
import { TenantEntity } from './entities/tenant.entity'
import { OnboardController } from './public-tenant.controller'
// import { TenantLookupController } from './tenant-lookup.controller'
import { TenantController } from './tenant.controller'
import { TenantService } from './tenant.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([TenantEntity, UserEntity]),
    SettingsModule,
    MailModule,
    SubscriptionPlanModule,
  ],
  controllers: [TenantController, OnboardController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
