import { Module } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { CouponModule } from './coupon/coupon.module';
import { PromotionModule } from './promotion/promotion.module';

@Module({
  imports: [OrderModule, CouponModule, PromotionModule],
  exports: [OrderModule, CouponModule, PromotionModule],
})
export class SalesModule {}
