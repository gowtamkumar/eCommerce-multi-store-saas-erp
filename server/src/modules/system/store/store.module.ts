import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { SubscriptionPlanModule } from '@/modules/system/subscription-plan/subscription-plan.module'
import { OnboardController } from './public-store.controller'
import { StoreController } from './store.controller'
import { StoreService } from './store.service'
import { StoreRepository } from './store.repository'
import { StoreFeatureRepository } from './repositories/store-feature.repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StoreEntity } from './entities/store.entity'
import { StoreFeatureEntity } from './entities/store-feature.entity'
import { UserModule } from '@/modules/admin/core/user/user.module'
import { Global, Module } from '@nestjs/common'
import { RbacModule } from '@/modules/admin/core/rbac/rbac.module'

import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([StoreEntity, StoreFeatureEntity]),
    SettingsModule,
    MailModule,
    SubscriptionPlanModule,
    UserModule,
    RbacModule,
    NotificationModule,
  ],
  controllers: [StoreController, OnboardController],
  providers: [StoreService, StoreRepository, StoreFeatureRepository],
  exports: [StoreService, StoreRepository, StoreFeatureRepository, TypeOrmModule],
})
export class StoreModule {}
