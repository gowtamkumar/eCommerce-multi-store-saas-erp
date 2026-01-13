import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderEntity } from './entities/order.entity';
import { ProductEntity } from '../product/entities/product.entity';
import { UserEntity } from '../admin/user/entities/user.entity';
import { LeadEntity } from '../lead/entities/lead.entity';
import { SiteSettingsEntity } from '../settings/entities/site-settings.entity';

import { PaymentEntity } from '../payment/entities/payment.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            OrderEntity,
            ProductEntity,
            UserEntity,
            LeadEntity,
            SiteSettingsEntity,
            PaymentEntity,
        ]),
    ],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService],
})
export class OrderModule { }
