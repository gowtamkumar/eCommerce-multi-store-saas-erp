import { InvoiceModule } from '@/modules/admin/operations/finance/invoice/invoice.module'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { InventoryTransactionModule } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.module'
import { CouponModule } from '@/modules/admin/sales/coupon/coupon.module'
import { OrderController } from '@/modules/admin/sales/order/controllers/order.controller'
import { OrderService } from '@/modules/admin/sales/order/services/order.service'
import { ReturnController } from '@/modules/admin/sales/order/controllers/return.controller'
import { ReturnService } from '@/modules/admin/sales/order/services/return.service'
import { CartModule } from '@/modules/store/cart/cart.module'
import { ShippingAddressModule } from '@/modules/store/shipping-address/shipping-address.module'
import { Module } from '@nestjs/common'
import { PaymentModule } from '../payment/payment.module'
import { BullModule } from '@nestjs/bullmq'
import { OrderProcessor } from './queue/order.processor'

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'order',
    }),
    CouponModule,
    PaymentModule,
    CartModule,
    InventoryTransactionModule,
    InvoiceModule,
    ShippingAddressModule,
    MailModule,
  ],
  controllers: [OrderController, ReturnController], // Registered
  providers: [OrderService, ReturnService, OrderProcessor], // Registered
  exports: [OrderService, ReturnService],
})
export class OrderModule { }
