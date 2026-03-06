import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../product/entities/product.entity';
import { SiteSettingsEntity } from '../settings/entities/site-settings.entity';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItemEntity } from './entities/cart-item.entity';
import { CartEntity } from './entities/cart.entity';
import { CouponModule } from '../coupon/coupon.module';
import { PromotionModule } from '../promotion/promotion.module';

@Module({
    imports: [TypeOrmModule.forFeature([CartEntity, CartItemEntity, ProductEntity, SiteSettingsEntity]), CouponModule, PromotionModule],
    controllers: [CartController],
    providers: [CartService],
    exports: [CartService],
})
export class CartModule { }
