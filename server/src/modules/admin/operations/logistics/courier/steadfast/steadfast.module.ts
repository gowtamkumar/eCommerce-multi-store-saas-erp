import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OrderModule } from '@/modules/admin/sales/order/order.module';
import { SettingsModule } from '@/modules/admin/settings/settings.module';
import { SteadfastController } from '@/modules/admin/operations/logistics/courier/steadfast/steadfast.controller';
import { SteadfastService } from '@/modules/admin/operations/logistics/courier/steadfast/steadfast.service';

@Module({
  imports: [HttpModule, SettingsModule, OrderModule],
  controllers: [SteadfastController],
  providers: [SteadfastService],
  exports: [SteadfastService],
})
export class SteadfastModule { }
