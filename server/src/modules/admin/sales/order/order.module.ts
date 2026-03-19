import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { CartModule } from '@/modules/user/cart/cart.module'
import { LeadEntity } from '@/modules/admin/customer/lead/entities/lead.entity'
import { PaymentEntity } from '@/modules/user/payment/entities/payment.entity'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { ProductVariantEntity } from '@/modules/admin/catalog/product/entities/variant.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { OrderItemEntity } from '@/modules/admin/sales/order/entities/order-item.entity'
import { OrderReturnEntity } from '@/modules/admin/sales/order/entities/order-return.entity'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { OrderController } from '@/modules/admin/sales/order/order.controller'
import { OrderService } from '@/modules/admin/sales/order/order.service'
import { ReturnController } from '@/modules/admin/sales/order/return.controller'
import { ReturnService } from '@/modules/admin/sales/order/return.service'
import { InventoryTransactionModule } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.module'
import { CouponModule } from '@/modules/admin/sales/coupon/coupon.module'

@Module({
  imports: [
    CouponModule,
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
    InventoryTransactionModule,
  ],
  controllers: [OrderController, ReturnController], // Registered
  providers: [OrderService, ReturnService], // Registered
  exports: [OrderService, ReturnService],
})
export class OrderModule { }
