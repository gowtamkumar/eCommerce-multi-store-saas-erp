import { Module } from '@nestjs/common'
import { CartModule as StoreCartModule } from '@/modules/store/cart/cart.module'
import { AdminCartController } from './controllers/cart.controller'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [StoreCartModule, TenantModule],
  controllers: [AdminCartController],
})
export class AdminCartModule {}
