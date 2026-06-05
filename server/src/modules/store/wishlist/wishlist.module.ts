import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WishlistEntity } from './entities/wishlist.entity'
import { WishlistRepository } from './wishlist.repository'
import { WishlistController } from './wishlist.controller'
import { WishlistService } from './wishlist.service'
import { PricingEngineService } from '@/common/services/pricing-engine.service'
import { PromotionModule } from '@/modules/admin/sales/promotion/promotion.module'
import { ProductModule } from '@/modules/admin/catalog/product/product.module'

@Module({
  imports: [TypeOrmModule.forFeature([WishlistEntity]), PromotionModule, ProductModule],
  controllers: [WishlistController],
  providers: [WishlistService, PricingEngineService, WishlistRepository],
  exports: [WishlistService, WishlistRepository],
})
export class WishlistModule {}
