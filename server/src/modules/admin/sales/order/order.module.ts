import { InvoiceModule } from '@/modules/admin/operations/finance/invoice/invoice.module'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'
import { InventoryTransactionModule } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.module'
import { CouponModule } from '@/modules/admin/sales/coupon/coupon.module'
import { OrderController } from '@/modules/admin/sales/order/order.controller'
import { OrderService } from '@/modules/admin/sales/order/order.service'
import { ReturnController } from '@/modules/admin/sales/order/return.controller'
import { ReturnService } from '@/modules/admin/sales/order/return.service'
import { CartModule } from '@/modules/store/cart/cart.module'
import { ShippingAddressModule } from '@/modules/store/shipping-address/shipping-address.module'
import { Module } from '@nestjs/common'
import { PaymentModule } from '../payment/payment.module'

@Module({
  imports: [
    CouponModule,
    PaymentModule,
    CartModule,
    InventoryTransactionModule,
    InvoiceModule,
    ShippingAddressModule,
    MailModule,
  ],
  controllers: [OrderController, ReturnController], // Registered
  providers: [OrderService, ReturnService], // Registered
  exports: [OrderService, ReturnService],
})
export class OrderModule { }
