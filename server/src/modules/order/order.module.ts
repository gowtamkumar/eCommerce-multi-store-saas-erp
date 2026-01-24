import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../admin/user/entities/user.entity';
import { LeadEntity } from '../lead/entities/lead.entity';
import { ProductEntity } from '../product/entities/product.entity';
import { SiteSettingsEntity } from '../settings/entities/site-settings.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

import { CartModule } from '../cart/cart.module';
import { PaymentEntity } from '../payment/entities/payment.entity';
import { ProductVariantEntity } from '../product/entities/variant.entity';
import { OrderItemEntity } from './entities/order-item.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            OrderEntity,
            ProductEntity,
            UserEntity,
            LeadEntity,
            SiteSettingsEntity,
            PaymentEntity,
            OrderItemEntity,
            ProductVariantEntity,
        ]),
        CartModule,
    ],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService],
})
export class OrderModule { }
