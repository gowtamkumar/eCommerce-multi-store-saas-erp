import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OrderModule } from '../../order/order.module';
import { SettingsModule } from '../../settings/settings.module';
import { SteadfastController } from './steadfast.controller';
import { SteadfastService } from './steadfast.service';

@Module({
  imports: [HttpModule, SettingsModule, OrderModule],
  controllers: [SteadfastController],
  providers: [SteadfastService],
  exports: [SteadfastService],
})
export class SteadfastModule {}
