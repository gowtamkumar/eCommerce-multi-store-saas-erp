import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../order/entities/order.entity';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentActionController } from './payment-action.controller';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

import { SettingsModule } from '../settings/settings.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PaymentEntity, OrderEntity]),
        SettingsModule
    ],
    controllers: [PaymentController, PaymentActionController],
    providers: [PaymentService],
    exports: [PaymentService],
})
export class PaymentModule { }
