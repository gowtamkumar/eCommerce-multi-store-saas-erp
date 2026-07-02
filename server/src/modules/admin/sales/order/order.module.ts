import { StoreModule } from '@/modules/system/store/store.module'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { SmsModule } from '@/modules/admin/operations/infra/sms/sms.module'
import { PushModule } from '@/modules/admin/operations/infra/push/push.module'
import { InventoryLedgerModule } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.module'
import { CouponModule } from '@/modules/admin/sales/coupon/coupon.module'
import { OrderController } from '@/modules/admin/sales/order/controllers/order.controller'
import { OrderService } from '@/modules/admin/sales/order/services/order.service'
import { OrderCheckoutService } from '@/modules/admin/sales/order/services/order-checkout.service'
import { OrderLifecycleService } from '@/modules/admin/sales/order/services/order-lifecycle.service'
import { ReturnController } from '@/modules/admin/sales/order/controllers/return.controller'
import { ReturnService } from '@/modules/admin/sales/order/services/return.service'
import { CartModule } from '@/modules/store/cart/cart.module'
import { ShippingAddressModule } from '@/modules/store/shipping-address/shipping-address.module'
import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrderEntity } from './entities/order.entity'
import { OrderItemEntity } from './entities/order-item.entity'
import { OrderReturnEntity } from './entities/order-return.entity'
import { OrderRepository } from './repositories/order.repository'
import { OrderReturnRepository } from './repositories/order-return.repository'
import { PricingModule } from '@/modules/admin/catalog/pricing/pricing.module'
import { PaymentModule } from '../payment/payment.module'
import { BullModule } from '@nestjs/bullmq'
import { OrderProcessor } from './queue/order.processor'
import { OrderProcessHelper } from './services/order-process.helper'
import { OrderSchedulerService } from './services/order-scheduler.service'
import { ScheduleModule } from '@nestjs/schedule'

import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'
import { LoyaltyModule } from '@/modules/admin/marketing/loyalty/loyalty.module'

@Module({
  imports: [
    StoreModule,
    BullModule.registerQueue({
      name: 'order',
    }),
    BullModule.registerQueue({
      name: 'accounting',
    }),
    BullModule.registerQueue({
      name: 'invoice',
    }),
    BullModule.registerQueue({
      name: 'fulfillment',
    }),
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, OrderReturnEntity]),
    CouponModule,
    forwardRef(() => PaymentModule),
    CartModule,
    InventoryLedgerModule,
    ShippingAddressModule,
    MailModule,
    SmsModule,
    PushModule,
    NotificationModule,
    PricingModule,
    LoyaltyModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [OrderController, ReturnController], // Registered
  providers: [
    OrderService,
    OrderCheckoutService,
    OrderLifecycleService,
    ReturnService,
    OrderProcessor,
    OrderProcessHelper,
    OrderSchedulerService,
    OrderRepository,
    OrderReturnRepository,
  ],
  exports: [OrderService, ReturnService, OrderRepository, OrderReturnRepository],
})
export class OrderModule {}
