import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { OrderModule } from '@/modules/admin/sales/order/order.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { SteadfastController } from '@/modules/admin/operations/logistics/courier/steadfast/steadfast.controller'
import { SteadfastService } from '@/modules/admin/operations/logistics/courier/steadfast/steadfast.service'

import { StoreModule } from '@/modules/system/store/store.module'

@Module({
  imports: [HttpModule, SettingsModule, OrderModule, CacheModule, StoreModule],
  controllers: [SteadfastController],
  providers: [SteadfastService],
  exports: [SteadfastService],
})
export class SteadfastModule {}
