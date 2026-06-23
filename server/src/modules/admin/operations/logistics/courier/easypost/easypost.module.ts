import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { EasyPostService } from './easypost.service'
import { EasyPostController } from './easypost.controller'
import { OrderModule } from '@/modules/admin/sales/order/order.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'

@Module({
  imports: [HttpModule, OrderModule, SettingsModule],
  controllers: [EasyPostController],
  providers: [EasyPostService],
  exports: [EasyPostService],
})
export class EasyPostModule {}
