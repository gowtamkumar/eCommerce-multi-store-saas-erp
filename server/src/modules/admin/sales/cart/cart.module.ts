import { Module, forwardRef } from '@nestjs/common'
import { AiModule } from '@/modules/admin/ai/ai.module'
import { CartModule as StoreCartModule } from '@/modules/store/cart/cart.module'
import { StoreModule } from '@/modules/system/store/store.module'
import { AdminCartController } from './controllers/cart.controller'

@Module({
  imports: [StoreCartModule, StoreModule, forwardRef(() => AiModule)],
  controllers: [AdminCartController],
})
export class AdminCartModule {}
