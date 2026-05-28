import { PricingEngineService } from '@/common/services/pricing-engine.service'
import { CouponModule } from '@/modules/admin/sales/coupon/coupon.module'
import { PromotionModule } from '@/modules/admin/sales/promotion/promotion.module'
import { UserModule } from '@/modules/admin/core/user/user.module'
import { PricingModule } from '@/modules/admin/catalog/pricing/pricing.module'
import { Module } from '@nestjs/common'
import { CartController } from './cart.controller'
import { CartService } from './cart.service'

@Module({
  imports: [CouponModule, PromotionModule, UserModule, PricingModule],
  controllers: [CartController],
  providers: [CartService, PricingEngineService],
  exports: [CartService],
})
export class CartModule {}
