import { TrafficInterceptor } from '@/common/interceptors/traffic.interceptor'
import { AuditLogModule } from '@/modules/system/audit-log/audit-log.module'
import { ProductModule } from '@/modules/admin/catalog/product/product.module'
import { PageModule } from '@/modules/admin/content/page/page.module'
import { UserModule } from '@/modules/admin/core/user/user.module'
import { AuthModule } from '@/modules/admin/core/auth/auth.module'
import { OrderModule } from '@/modules/admin/sales/order/order.module'
import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { SubscriptionPlanModule } from '../subscription-plan/subscription-plan.module'
import { AddonCatalogModule } from '../addon-catalog/addon-catalog.module'
import { SuperAdminController } from './super-admin.controller'
import { TrafficService } from './traffic.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubscriptionInvoiceEntity } from '../subscription-billing/entities/subscription-invoice.entity'

@Module({
  imports: [
    UserModule,
    TenantModule,
    OrderModule,
    ProductModule,
    PageModule,
    SubscriptionPlanModule,
    AddonCatalogModule,
    AuthModule,
    AuditLogModule,
    TypeOrmModule.forFeature([SubscriptionInvoiceEntity]),
  ],
  controllers: [SuperAdminController],
  providers: [
    TrafficService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TrafficInterceptor,
    },
  ],
  exports: [TrafficService],
})
export class SuperAdminModule {}

