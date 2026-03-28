import { PricingEngineService } from '@/common/services/pricing-engine.service'
import { CouponModule } from '@/modules/admin/sales/coupon/coupon.module'
import { PromotionModule } from '@/modules/admin/sales/promotion/promotion.module'
import { Module } from '@nestjs/common'
import { CartController } from './cart.controller'
import { CartService } from './cart.service'


@Module({
  imports: [
    CouponModule,
    PromotionModule,
  ],
  controllers: [CartController],
  providers: [CartService, PricingEngineService],
  exports: [CartService],
})
export class CartModule {}
