import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { WishlistItemEntity } from './entities/wishlist-item.entity';
import { WishlistEntity } from './entities/wishlist.entity';

@Injectable()
export class WishlistService {
    constructor(
        @InjectRepository(WishlistEntity)
        private readonly wishlistRepository: Repository<WishlistEntity>,
        @InjectRepository(WishlistItemEntity)
        private readonly wishlistItemRepository: Repository<WishlistItemEntity>,
    ) {}

    async createOrGetWishlist(userId: string, tenantId: string): Promise<WishlistEntity> {
        let wishlist = await this.wishlistRepository.findOne({
            where: { userId, tenantId },
            relations: ['items', 'items.product'],
        });

        if (!wishlist) {
            wishlist = this.wishlistRepository.create({
                userId,
                tenantId,
                items: [],
            });
            await this.wishlistRepository.save(wishlist);
        }

        return wishlist;
    }

    async addToWishlist(
        userId: string,
        tenantId: string,
        createWishlistItemDto: CreateWishlistItemDto,
    ): Promise<WishlistEntity> {
        const wishlist = await this.createOrGetWishlist(userId, tenantId);
        const { productId } = createWishlistItemDto;

        // Check if item already exists in wishlist
        const exists = wishlist.items.some((item) => item.productId === productId);

        if (!exists) {
            const item = this.wishlistItemRepository.create({
                wishlistId: wishlist.id,
                productId,
                tenantId,
            });
            await this.wishlistItemRepository.save(item);
        }

        return this.createOrGetWishlist(userId, tenantId);
    }

    async removeFromWishlist(userId: string, tenantId: string, productId: string): Promise<WishlistEntity> {
        const wishlist = await this.createOrGetWishlist(userId, tenantId);
        const item = await this.wishlistItemRepository.findOne({
            where: { wishlistId: wishlist.id, productId, tenantId },
        });

        if (item) {
            await this.wishlistItemRepository.remove(item);
        } else {
             throw new NotFoundException('Item not found in wishlist');
        }

        return this.createOrGetWishlist(userId, tenantId);
    }
}
