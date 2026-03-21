import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItemEntity } from './entities/cart-item.entity';
import { CartEntity } from './entities/cart.entity';
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity';
import { CouponService } from '@/modules/admin/sales/coupon/coupon.service';
import { PromotionService } from '@/modules/admin/sales/promotion/promotion.service';
import { PromotionTargetType } from '@/modules/admin/sales/promotion/enums/promotion-target-type.enum';
import { PromotionType } from '@/modules/admin/sales/promotion/enums/promotion-type.enum';
import { DiscountType } from '@/common/enums/discount-type.enum';
import { PricingUtil } from '@/common/utils/pricing.util';

@Injectable()
export class CartService {
    private readonly logger = new Logger(CartService.name);

    constructor(
        @InjectRepository(CartEntity)
        private readonly cartRepository: Repository<CartEntity>,
        @InjectRepository(CartItemEntity)
        private readonly cartItemRepository: Repository<CartItemEntity>,
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        @InjectRepository(SiteSettingsEntity)
        private readonly siteSettingsRepository: Repository<SiteSettingsEntity>,
        private readonly couponService: CouponService,
        private readonly promotionService: PromotionService,
    ) { }

    async createOrGetCart(userId: string, tenantId: string): Promise<any> {
        this.logger.log(`${this.createOrGetCart.name} Service Called`);
        const cart = await this.findOrCreateCart(userId, tenantId);
        return this.transformCart(cart, tenantId);
    }

    private async findOrCreateCart(userId: string, tenantId: string): Promise<CartEntity> {
        this.logger.log(`${this.findOrCreateCart.name} Service Called`);
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
        this.logger.log(`${this.transformCart.name} Service Called`);
        // Fetch site settings for currency
        const settings = await this.siteSettingsRepository.findOne({
            where: { tenantId },
        });
        const currency = settings?.currency || 'BDT';

        // Fetch active promotions
        const activePromotions = await this.promotionService.findActivePromotions(tenantId);

        // Calculate and transform items
        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        const transformedItems = (cart.items || []).map((item) => {
            // Apply product discount based on discountType
            const basePrice = Number(item.variant?.price || item.product?.price || 0);
            const discountType = item.product?.discountType || DiscountType.FIXED;
            let discount = PricingUtil.calculateDiscountAmount(basePrice, Number(item.product?.discountAmount || 0), discountType);

            // Check for best applicable promotional offer for this item
            let bestPromoDiscount = 0;
            for (const promo of activePromotions) {
                let applies = false;
                if (promo.targetType === PromotionTargetType.SPECIFIC_PRODUCT && promo.targetId === item.productId) {
                    applies = true;
                } else if (promo.targetType === PromotionTargetType.SPECIFIC_CATEGORY && promo.targetId === item.product?.categoryId) {
                    applies = true;
                } else if (promo.targetType === PromotionTargetType.SPECIFIC_BRAND && promo.targetId === item.product?.brandId) {
                    applies = true;
                }

                if (applies) {
                    let calcDiscount = 0;
                    if (promo.promotionType === PromotionType.PERCENTAGE) {
                        calcDiscount = (basePrice * Number(promo.value)) / 100;
                    } else if (promo.promotionType === PromotionType.FIXED_AMOUNT) {
                        calcDiscount = Number(promo.value);
                    }
                    if (calcDiscount > bestPromoDiscount) {
                        bestPromoDiscount = calcDiscount;
                    }
                }
            }

            // Apply whichever is higher: direct product discount or promotional discount
            discount = Math.max(discount, bestPromoDiscount);

            const taxRate = Number(item.product?.taxRate || 0);
            const pricing = PricingUtil.calculateItemPricing(basePrice, discount, taxRate);

            const quantity = Number(item.quantity);
            const lineTotal = pricing.finalPrice * quantity;

            subtotal += pricing.basePrice * quantity;
            totalDiscount += pricing.discountAmount * quantity;
            totalTax += pricing.taxAmount * quantity;

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
                    base_price: pricing.basePrice,
                    discount: pricing.discountAmount,
                    tax: pricing.taxAmount,
                    final_price: pricing.finalPrice,
                },
                quantity,
                line_total: lineTotal,
                stock_status: (item.variant?.stock || item.product?.stock || 0) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
            };
        });

        let payable = subtotal - totalDiscount;

        // Calculate Order-Level Promotions (Entire Order / Min Cart Value)
        let orderLevelPromoDiscount = 0;
        for (const promo of activePromotions) {
            let applies = false;
            if (promo.targetType === PromotionTargetType.ENTIRE_ORDER) {
                applies = true;
            } else if (promo.targetType === PromotionTargetType.MINIMUM_CART_VALUE && promo.minOrderValue && payable >= promo.minOrderValue) {
                applies = true;
            }

            if (applies) {
                let calcDiscount = 0;
                if (promo.promotionType === PromotionType.PERCENTAGE) {
                    calcDiscount = (payable * Number(promo.value)) / 100;
                } else if (promo.promotionType === PromotionType.FIXED_AMOUNT) {
                    calcDiscount = Number(promo.value);
                }
                if (calcDiscount > orderLevelPromoDiscount) {
                    orderLevelPromoDiscount = calcDiscount;
                }
            }
        }

        // Apply order-level promo discounts
        orderLevelPromoDiscount = Math.min(orderLevelPromoDiscount, payable);
        payable -= orderLevelPromoDiscount;

        let couponDiscountAmount = 0;
        let isFreeShipping = false;

        if (cart.appliedCouponCode) {
            try {
                // We use validateCoupon to get the discount amount but we don't throw error if invalid to not break cart loading
                const validation = await this.couponService.validateCoupon(cart.appliedCouponCode, payable, tenantId);
                if (validation.valid) {
                    couponDiscountAmount = validation.discountAmount;
                    payable -= couponDiscountAmount;

                    if (validation.coupon.discountType === DiscountType.FREE_SHIPPING || validation.coupon.discountType as any === 'free_shipping') {
                        isFreeShipping = true;
                    }
                }
            } catch (error) {
                // If coupon invalid (e.g., expired), we could remove it. For now, we just ignore it for calculation.
            }
        }

        // We report orderLevelPromoDiscount separately or merged it with totalDiscount
        // To keep the API interface intact, we can add it to offer_discount.
        totalDiscount += orderLevelPromoDiscount;

        return {
            cart_id: cart.id,
            currency,
            items: transformedItems,
            summary: {
                subtotal: subtotal,
                offer_discount: totalDiscount, // Includes product discounts AND order level promo discounts
                coupon_discount: couponDiscountAmount,
                tax: totalTax,
                payable: payable + totalTax,
                is_free_shipping: isFreeShipping,
            },
            appliedCouponCode: cart.appliedCouponCode,
        };
    }

    async addToCart(userId: string, tenantId: string, createCartItemDto: CreateCartItemDto): Promise<any> {
        this.logger.log(`${this.addToCart.name} Service Called`);
        const cart = await this.findOrCreateCart(userId, tenantId);
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
        this.logger.log(`${this.updateCartItem.name} Service Called`);
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
        this.logger.log(`${this.removeFromCart.name} Service Called`);
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
        this.logger.log(`${this.clearCart.name} Service Called`);
        const cart = await this.findOrCreateCart(userId, tenantId);
        await this.cartItemRepository.remove(cart.items);
    }

    async syncCart(userId: string, tenantId: string, items: CreateCartItemDto[]): Promise<any> {
        this.logger.log(`${this.syncCart.name} Service Called`);
        const cart = await this.findOrCreateCart(userId, tenantId);

        // Clear existing items
        if (cart.items && cart.items.length > 0) {
            await this.cartItemRepository.remove(cart.items);
            cart.items = []; // Reset locally
        }

        // Add new items
        for (const item of items) {
            let { productId, variantId, quantity } = item;

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

            const cartItem = this.cartItemRepository.create({
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

    async applyCoupon(userId: string, tenantId: string, code: string): Promise<any> {
        this.logger.log(`${this.applyCoupon.name} Service Called`);
        const cart = await this.findOrCreateCart(userId, tenantId);

        // Calculate current subtotal/payable before coupon to validate it
        const currentCart = await this.transformCart(cart, tenantId);
        const payableBeforeCoupon = currentCart.summary.payable + currentCart.summary.coupon_discount;

        // Validates and throws error if invalid
        await this.couponService.validateCoupon(code, payableBeforeCoupon, tenantId);

        cart.appliedCouponCode = code.toUpperCase();
        await this.cartRepository.save(cart);

        return this.createOrGetCart(userId, tenantId);
    }

    async removeCoupon(userId: string, tenantId: string): Promise<any> {
        this.logger.log(`${this.removeCoupon.name} Service Called`);
        const cart = await this.findOrCreateCart(userId, tenantId);
        cart.appliedCouponCode = null;
        await this.cartRepository.save(cart);

        return this.createOrGetCart(userId, tenantId);
    }
}
