import { Module, forwardRef } from '@nestjs/common'
import { AiModule } from '@/modules/admin/ai/ai.module'
import { CartModule as StoreCartModule } from '@/modules/store/cart/cart.module'
import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { AdminCartController } from './controllers/cart.controller'

@Module({
  imports: [StoreCartModule, TenantModule, forwardRef(() => AiModule)],
  controllers: [AdminCartController],
})
export class AdminCartModule {}
