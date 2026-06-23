import { Module } from '@nestjs/common'
import { PathaoModule } from './pathao/pathao.module'
import { SteadfastModule } from './steadfast/steadfast.module'
import { EasyPostModule } from './easypost/easypost.module'
import { CourierWebhookController } from './webhooks/courier-webhook.controller'
import { OrderModule } from '@/modules/admin/sales/order/order.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'

@Module({
  imports: [PathaoModule, SteadfastModule, EasyPostModule, OrderModule, SettingsModule],
  controllers: [CourierWebhookController],
  exports: [PathaoModule, SteadfastModule, EasyPostModule],
})
export class CourierModule {}
