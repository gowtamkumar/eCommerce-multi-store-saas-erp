import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../product/entities/product.entity';
import { SiteSettingsEntity } from '../settings/entities/site-settings.entity';
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
        @InjectRepository(SiteSettingsEntity)
        private readonly siteSettingsRepository: Repository<SiteSettingsEntity>,
    ) {}

    async createOrGetCart(userId: string, tenantId: string): Promise<any> {
        const cart = await this.findOrCreateCartEntity(userId, tenantId);
        return this.transformCart(cart, tenantId);
    }

    private async findOrCreateCartEntity(userId: string, tenantId: string): Promise<CartEntity> {
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

    private async transformCart(cart: CartEntity, tenantId: string): Promise<any> {
        // Fetch site settings for currency
        const settings = await this.siteSettingsRepository.findOne({
            where: { tenantId },
        });
        const currency = settings?.currency || 'BDT';

        // Calculate and transform items
        let subtotal = 0;
        let totalDiscount = 0;

        const transformedItems = (cart.items || []).map((item) => {
            const basePrice = Number(item.variant?.price || item.product?.price || 0);
            const discount = Number(item.product?.discountAmount || 0);
            const finalPrice = basePrice - discount;
            const quantity = Number(item.quantity);
            const lineTotal = finalPrice * quantity;

            subtotal += basePrice * quantity;
            totalDiscount += discount * quantity;

            return {
                cart_item_id: item.id,
                product: {
                    id: item.product?.id,
                    name: item.product?.name,
                    image: item.product?.images?.[0] || null,
                },
                variant: item.variant ? {
                    id: item.variant.id,
                    sku: item.variant.sku,
                    attributes: item.variant.combination ? Object.entries(item.variant.combination).map(([name, value]) => ({
                        name,
                        value: String(value),
                    })) : [],
                } : null,
                pricing: {
                    base_price: basePrice,
                    discount: discount,
                    final_price: finalPrice,
                },
                quantity,
                line_total: lineTotal,
                stock_status: (item.variant?.stock || item.product?.stock || 0) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
            };
        });

        return {
            cart_id: cart.id,
            currency,
            items: transformedItems,
            summary: {
                subtotal: subtotal,
                offer_discount: totalDiscount,
                coupon_discount: 0,
                payable: subtotal - totalDiscount,
            },
        };
    }

    async addToCart(userId: string, tenantId: string, createCartItemDto: CreateCartItemDto): Promise<any> {
        const cart = await this.findOrCreateCartEntity(userId, tenantId);
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

        // Check if item already exists in cart using raw entity items
        let cartItem = (cart.items || []).find((item) => {
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

        // Return transformed cart
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
        const cart = await this.findOrCreateCartEntity(userId, tenantId);
        await this.cartItemRepository.remove(cart.items);
    }
}
