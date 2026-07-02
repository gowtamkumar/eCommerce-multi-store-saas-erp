import { TrafficInterceptor } from '@/common/interceptors/traffic.interceptor'
import { AuditLogModule } from '@/modules/system/audit-log/audit-log.module'
import { ProductModule } from '@/modules/admin/catalog/product/product.module'
import { PageModule } from '@/modules/admin/content/page/page.module'
import { UserModule } from '@/modules/admin/core/user/user.module'
import { AuthModule } from '@/modules/admin/core/auth/auth.module'
import { OrderModule } from '@/modules/admin/sales/order/order.module'
import { StoreModule } from '@/modules/system/store/store.module'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { SubscriptionPlanModule } from '../subscription-plan/subscription-plan.module'
import { AddonCatalogModule } from '../addon-catalog/addon-catalog.module'
import { PlatformModule } from '../platform/platform.module'
import { SuperAdminStoresController } from './controllers/super-admin-stores.controller'
import { SuperAdminUsersController } from './controllers/super-admin-users.controller'
import { SuperAdminBillingController } from './controllers/super-admin-billing.controller'
import { SuperAdminPlatformController } from './controllers/super-admin-platform.controller'
import { SuperAdminAiController } from './controllers/super-admin-ai.controller'
import { TrafficService } from './traffic.service'
import { SuperAdminService } from './super-admin.service'
import { SuperAdminCrossStoreRepository } from './repositories/super-admin-cross-store.repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StoreTrafficEntity } from './entities/store-traffic.entity'
import { TrafficRepository } from './traffic.repository'

@Module({
  imports: [
    UserModule,
    StoreModule,
    MailModule,
    OrderModule,
    ProductModule,
    PageModule,
    SubscriptionPlanModule,
    AddonCatalogModule,
    AuthModule,
    AuditLogModule,
    PlatformModule,
    TypeOrmModule.forFeature([StoreTrafficEntity]),
  ],
  controllers: [
    SuperAdminStoresController,
    SuperAdminUsersController,
    SuperAdminBillingController,
    SuperAdminPlatformController,
    SuperAdminAiController,
  ],
  providers: [
    TrafficService,
    TrafficRepository,
    SuperAdminService,
    SuperAdminCrossStoreRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: TrafficInterceptor,
    },
  ],
  exports: [TrafficService, SuperAdminService],
})
export class SuperAdminModule {}
