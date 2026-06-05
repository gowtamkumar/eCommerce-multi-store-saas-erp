import { PricingEngineService } from '@/common/services/pricing-engine.service'
import { CouponModule } from '@/modules/admin/sales/coupon/coupon.module'
import { PromotionModule } from '@/modules/admin/sales/promotion/promotion.module'
import { UserModule } from '@/modules/admin/core/user/user.module'
import { PricingModule } from '@/modules/admin/catalog/pricing/pricing.module'
import { ProductModule } from '@/modules/admin/catalog/product/product.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CartEntity } from './entities/cart.entity'
import { CartItemEntity } from './entities/cart-item.entity'
import { CartRepository } from './cart.repository'
import { CartItemRepository } from './cart-item.repository'
import { CartController } from './cart.controller'
import { CartService } from './cart.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity, CartItemEntity]),
    CouponModule,
    PromotionModule,
    UserModule,
    PricingModule,
    ProductModule,
    SettingsModule,
  ],
  controllers: [CartController],
  providers: [CartService, PricingEngineService, CartRepository, CartItemRepository],
  exports: [CartService, CartRepository, CartItemRepository],
})
export class CartModule {}
