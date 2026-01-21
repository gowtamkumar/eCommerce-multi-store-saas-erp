import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItemEntity } from './entities/cart-item.entity';
import { CartEntity } from './entities/cart.entity';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(CartEntity)
        private readonly cartRepository: Repository<CartEntity>,
        @InjectRepository(CartItemEntity)
        private readonly cartItemRepository: Repository<CartItemEntity>,
    ) {}

    async createOrGetCart(userId: string, tenantId: string): Promise<CartEntity> {
        let cart = await this.cartRepository.findOne({
            where: { userId, tenantId },
            relations: ['items', 'items.product', 'items.variant'],
        });

        if (!cart) {
            cart = this.cartRepository.create({
                userId,
                tenantId,
                items: [],
            });
            await this.cartRepository.save(cart);
        }

        return cart;
    }

    async addToCart(userId: string, tenantId: string, createCartItemDto: CreateCartItemDto): Promise<CartEntity> {
        const cart = await this.createOrGetCart(userId, tenantId);
        const { productId, variantId, quantity } = createCartItemDto;

        // Check if item already exists in cart
        // Handle variantId being undefined or null comparison
        let cartItem = cart.items.find((item) => {
            const sameProduct = item.productId === productId;
            const sameVariant = (item.variantId || null) === (variantId || null);
            return sameProduct && sameVariant;
        });

        if (cartItem) {
            cartItem.quantity = Number(cartItem.quantity) + Number(quantity);
            await this.cartItemRepository.save(cartItem);
        } else {
            cartItem = this.cartItemRepository.create({
                cartId: cart.id,
                productId,
                variantId: variantId || null,
                quantity: Number(quantity),
                tenantId,
            });
            await this.cartItemRepository.save(cartItem);
        }

        return this.createOrGetCart(userId, tenantId);
    }

    async updateCartItem(
        userId: string,
        tenantId: string,
        cartItemId: string,
        updateCartItemDto: UpdateCartItemDto,
    ): Promise<CartEntity> {
        const cartItem = await this.cartItemRepository.findOne({
            where: { id: cartItemId, tenantId },
            relations: ['cart'],
        });

        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        if (cartItem.cart.userId !== userId) {
             throw new NotFoundException('Cart item not found in user cart');
        }

        cartItem.quantity = updateCartItemDto.quantity;
        await this.cartItemRepository.save(cartItem);

        return this.createOrGetCart(userId, tenantId);
    }

    async removeFromCart(userId: string, tenantId: string, cartItemId: string): Promise<CartEntity> {
        const cartItem = await this.cartItemRepository.findOne({
            where: { id: cartItemId, tenantId },
            relations: ['cart'],
        });

         if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        if (cartItem.cart.userId !== userId) {
             throw new NotFoundException('Cart item not found in user cart');
        }

        await this.cartItemRepository.remove(cartItem);

        return this.createOrGetCart(userId, tenantId);
    }

    async clearCart(userId: string, tenantId: string): Promise<void> {
        const cart = await this.createOrGetCart(userId, tenantId);
        await this.cartItemRepository.remove(cart.items);
    }
}
