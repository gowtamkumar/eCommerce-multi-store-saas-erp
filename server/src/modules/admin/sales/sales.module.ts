import { Module } from '@nestjs/common'
import { OrderModule } from './order/order.module'
import { CouponModule } from './coupon/coupon.module'
import { PromotionModule } from './promotion/promotion.module'
import { PaymentModule } from './payment/payment.module'
import { AdminCartModule } from './cart/cart.module'

@Module({
  imports: [OrderModule, CouponModule, PromotionModule, PaymentModule, AdminCartModule],
  exports: [OrderModule, CouponModule, PromotionModule, PaymentModule, AdminCartModule],
})
export class SalesModule { }
