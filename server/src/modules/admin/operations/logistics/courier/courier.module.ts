import { Module } from '@nestjs/common'
import { PathaoModule } from './pathao/pathao.module'
import { SteadfastModule } from './steadfast/steadfast.module'
import { CourierWebhookController } from './webhooks/courier-webhook.controller'
import { OrderModule } from '@/modules/admin/sales/order/order.module'

@Module({
  imports: [PathaoModule, SteadfastModule, OrderModule],
  controllers: [CourierWebhookController],
  exports: [PathaoModule, SteadfastModule],
})
export class CourierModule {}
