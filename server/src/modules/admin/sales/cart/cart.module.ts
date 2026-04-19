import { Module } from '@nestjs/common'
import { CartModule as StoreCartModule } from '@/modules/store/cart/cart.module'
import { AdminCartController } from './controllers/cart.controller'

@Module({
  imports: [StoreCartModule],
  controllers: [AdminCartController],
})
export class AdminCartModule {}
