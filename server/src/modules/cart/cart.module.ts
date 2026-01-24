import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../product/entities/product.entity';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItemEntity } from './entities/cart-item.entity';
import { CartEntity } from './entities/cart.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CartEntity, CartItemEntity, ProductEntity])],
    controllers: [CartController],
    providers: [CartService],
    exports: [CartService],
})
export class CartModule {}
