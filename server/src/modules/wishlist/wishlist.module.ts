import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistItemEntity } from './entities/wishlist-item.entity';
import { WishlistEntity } from './entities/wishlist.entity';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

@Module({
    imports: [TypeOrmModule.forFeature([WishlistEntity, WishlistItemEntity])],
    controllers: [WishlistController],
    providers: [WishlistService],
    exports: [WishlistService],
})
export class WishlistModule {}
