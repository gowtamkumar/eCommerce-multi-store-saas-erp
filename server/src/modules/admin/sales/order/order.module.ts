import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { SmsModule } from '@/modules/admin/operations/infra/sms/sms.module'
import { PushModule } from '@/modules/admin/operations/infra/push/push.module'
import { InventoryLedgerModule } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.module'
import { CouponModule } from '@/modules/admin/sales/coupon/coupon.module'
import { OrderController } from '@/modules/admin/sales/order/controllers/order.controller'
import { OrderService } from '@/modules/admin/sales/order/services/order.service'
import { ReturnController } from '@/modules/admin/sales/order/controllers/return.controller'
import { ReturnService } from '@/modules/admin/sales/order/services/return.service'
import { CartModule } from '@/modules/store/cart/cart.module'
import { ShippingAddressModule } from '@/modules/store/shipping-address/shipping-address.module'
import { Module } from '@nestjs/common'
import { PricingModule } from '@/modules/admin/catalog/pricing/pricing.module'
import { PaymentModule } from '../payment/payment.module'
import { BullModule } from '@nestjs/bullmq'
import { OrderProcessor } from './queue/order.processor'
import { OrderProcessHelper } from './services/order-process.helper'

import { NotificationModule } from '@/modules/admin/operations/infra/notification/notification.module'
import { LoyaltyModule } from '@/modules/admin/marketing/loyalty/loyalty.module'

@Module({
  imports: [
    TenantModule,
    BullModule.registerQueue({
      name: 'order',
    }),
    CouponModule,
    PaymentModule,
    CartModule,
    InventoryLedgerModule,
    ShippingAddressModule,
    MailModule,
    SmsModule,
    PushModule,
    NotificationModule,
    PricingModule,
    LoyaltyModule,
  ],
  controllers: [OrderController, ReturnController], // Registered
  providers: [OrderService, ReturnService, OrderProcessor, OrderProcessHelper], // Registered
  exports: [OrderService, ReturnService],
})
export class OrderModule {}
