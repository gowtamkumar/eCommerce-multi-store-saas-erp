import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../product/entities/product.entity';
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
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
    ) {}

    async createOrGetCart(userId: string, tenantId: string): Promise<any> {
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

        // Calculate totals
        let subtotal = 0;
        let totalDiscount = 0;

        const items = cart.items.map((item) => {
            const price = Number(item.variant?.price || item.product?.price || 0);
            const discountAmount = Number(item.product?.discountAmount || 0);
            const quantity = Number(item.quantity);

            const itemSubtotal = price * quantity;
            const itemTotalDiscount = discountAmount * quantity;
            const itemTotal = itemSubtotal - itemTotalDiscount;

            subtotal += itemSubtotal;
            totalDiscount += itemTotalDiscount;

            return {
                ...item,
                price,
                discountAmount,
                itemSubtotal,
                itemTotalDiscount,
                itemTotal,
            };
        });

        return {
            ...cart,
            items,
            subtotal,
            totalDiscount,
            total: subtotal - totalDiscount,
        };
    }

    async addToCart(userId: string, tenantId: string, createCartItemDto: CreateCartItemDto): Promise<any> {
        const cart = await this.createOrGetCart(userId, tenantId);
        let { productId, variantId, quantity } = createCartItemDto;

        // If variantId is not provided, check if the product has variants and pick the first one
        if (!variantId) {
            const product = await this.productRepository.findOne({
                where: { id: productId, tenantId },
                relations: ['variants'],
            });
            if (product && product.variants && product.variants.length > 0) {
                variantId = product.variants[0].id;
            }
        }

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
    ): Promise<any> {
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

    async removeFromCart(userId: string, tenantId: string, cartItemId: string): Promise<any> {
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
