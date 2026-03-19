import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OrderModule } from '@/modules/admin/sales/order/order.module';
import { SettingsModule } from '@/modules/admin/settings/settings.module';
import { PathaoController } from '@/modules/admin/operations/logistics/courier/pathao/pathao.controller';
import { PathaoService } from '@/modules/admin/operations/logistics/courier/pathao/pathao.service';

@Module({
  imports: [HttpModule, SettingsModule, OrderModule],
  controllers: [PathaoController],
  providers: [PathaoService],
  exports: [PathaoService],
})
export class PathaoModule { }
