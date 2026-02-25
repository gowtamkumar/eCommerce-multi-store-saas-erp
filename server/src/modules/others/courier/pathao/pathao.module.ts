import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OrderModule } from 'src/modules/order/order.module';
import { SettingsModule } from 'src/modules/settings/settings.module';
import { PathaoController } from './pathao.controller';
import { PathaoService } from './pathao.service';

@Module({
  imports: [HttpModule, SettingsModule, OrderModule],
  controllers: [PathaoController],
  providers: [PathaoService],
  exports: [PathaoService],
})
export class PathaoModule {}
