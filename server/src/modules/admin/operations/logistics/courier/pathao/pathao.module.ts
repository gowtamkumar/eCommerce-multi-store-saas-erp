import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { OrderModule } from '@/modules/admin/sales/order/order.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { PathaoController } from '@/modules/admin/operations/logistics/courier/pathao/pathao.controller'
import { PathaoService } from '@/modules/admin/operations/logistics/courier/pathao/pathao.service'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [HttpModule, SettingsModule, OrderModule, CacheModule, TenantModule],
  controllers: [PathaoController],
  providers: [PathaoService],
  exports: [PathaoService],
})
export class PathaoModule {}
