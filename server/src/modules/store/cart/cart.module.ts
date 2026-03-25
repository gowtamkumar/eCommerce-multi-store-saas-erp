import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { CouponModule } from '@/modules/admin/sales/coupon/coupon.module'
import { PromotionModule } from '@/modules/admin/sales/promotion/promotion.module'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PricingEngineService } from '@/common/services/pricing-engine.service'
import { CartController } from './cart.controller'
import { CartService } from './cart.service'
import { CartItemEntity } from './entities/cart-item.entity'
import { CartEntity } from './entities/cart.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity, CartItemEntity, ProductEntity, SiteSettingsEntity]),
    CouponModule,
    PromotionModule,
  ],
  controllers: [CartController],
  providers: [CartService, PricingEngineService],
  exports: [CartService],
})
export class CartModule {}
