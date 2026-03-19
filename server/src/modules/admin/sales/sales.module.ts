import { Module } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { CouponModule } from './coupon/coupon.module';
import { PromotionModule } from './promotion/promotion.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [OrderModule, CouponModule, PromotionModule, PaymentModule],
  exports: [OrderModule, CouponModule, PromotionModule, PaymentModule],
})
export class SalesModule {}
