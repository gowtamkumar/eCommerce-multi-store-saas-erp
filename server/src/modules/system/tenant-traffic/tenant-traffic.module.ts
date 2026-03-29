import { TrafficInterceptor } from '@/common/interceptors/traffic.interceptor'
import { ProductModule } from '@/modules/admin/catalog/product/product.module'
import { PageModule } from '@/modules/admin/content/page/page.module'
import { UserModule } from '@/modules/admin/core/user/user.module'
import { OrderModule } from '@/modules/admin/sales/order/order.module'
import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { TenantTrafficController } from './tenant-traffic.controller'
import { TrafficService } from './traffic.service'

@Module({
  imports: [UserModule, TenantModule, OrderModule, ProductModule, PageModule],
  controllers: [TenantTrafficController],
  providers: [
    TrafficService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TrafficInterceptor,
    },
  ],
  exports: [TrafficService],
})
export class TenantTrafficModule {}
