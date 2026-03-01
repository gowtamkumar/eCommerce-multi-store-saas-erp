import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from '../admin/user/entities/user.entity'
import { CartModule } from '../cart/cart.module'
import { LeadEntity } from '../lead/entities/lead.entity'
import { PaymentEntity } from '../payment/entities/payment.entity'
import { ProductEntity } from '../product/entities/product.entity'
import { ProductVariantEntity } from '../product/entities/variant.entity'
import { SiteSettingsEntity } from '../settings/entities/site-settings.entity'
import { OrderItemEntity } from './entities/order-item.entity'
import { OrderReturnEntity } from './entities/order-return.entity'
import { OrderEntity } from './entities/order.entity'
import { OrderController } from './order.controller'
import { OrderService } from './order.service'
import { ReturnController } from './return.controller'
import { ReturnService } from './return.service'

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
      OrderReturnEntity, // Registered
    ]),
    CartModule,
  ],
  controllers: [OrderController, ReturnController], // Registered
  providers: [OrderService, ReturnService], // Registered
  exports: [OrderService, ReturnService],
})
export class OrderModule {}
