import { OrderModule } from '@/modules/admin/sales/order/order.module'
import { Module } from '@nestjs/common'
import { StoreReturnController } from './store-return.controller'

@Module({
  imports: [OrderModule],
  controllers: [StoreReturnController],
})
export class StoreReturnModule {}
