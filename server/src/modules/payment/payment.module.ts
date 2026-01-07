import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentActionController } from './payment-action.controller';
import { PaymentService } from './payment.service';
import { PaymentEntity } from './entities/payment.entity';
import { OrderEntity } from '../order/entities/order.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PaymentEntity, OrderEntity])],
    controllers: [PaymentController, PaymentActionController],
    providers: [PaymentService],
    exports: [PaymentService],
})
export class PaymentModule { }
