import { Module } from '@nestjs/common'
import { WishlistController } from './wishlist.controller'
import { WishlistService } from './wishlist.service'
import { PricingEngineService } from '@/common/services/pricing-engine.service'
import { PromotionModule } from '@/modules/admin/sales/promotion/promotion.module'

@Module({
  imports: [PromotionModule],
  controllers: [WishlistController],
  providers: [WishlistService, PricingEngineService],
  exports: [WishlistService],
})
export class WishlistModule {}
