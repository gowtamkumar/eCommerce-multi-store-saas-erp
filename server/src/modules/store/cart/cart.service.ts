import { DiscountType } from '@/common/enums/discount-type.enum'
import { PricingEngineService } from '@/common/services/pricing-engine.service'
import { ProductEntity } from '@/modules/admin/catalog/product/entities/product.entity'
import { CouponService } from '@/modules/admin/sales/coupon/coupon.service'
import { PromotionService } from '@/modules/admin/sales/promotion/promotion.service'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateCartItemDto } from './dto/create-cart-item.dto'
import { UpdateCartItemDto } from './dto/update-cart-item.dto'
import { CartItemEntity } from './entities/cart-item.entity'
import { CartEntity } from './entities/cart.entity'

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name)

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
    private readonly pricingEngine: PricingEngineService,
  ) {}

  async createOrGetCart(userId: string, tenantId: string): Promise<any> {
    this.logger.log(`${this.createOrGetCart.name} Service Called`)
    const cart = await this.findOrCreateCart(userId, tenantId)
    return this.transformCart(cart, tenantId)
  }

  private async findOrCreateCart(userId: string, tenantId: string): Promise<CartEntity> {
    this.logger.log(`${this.findOrCreateCart.name} Service Called`)
    let cart = await this.cartRepository.findOne({
      where: { userId, tenantId },
      relations: ['items', 'items.product', 'items.variant'],
    })

    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        tenantId,
        items: [],
      })
      await this.cartRepository.save(cart)
    }

    return cart
  }

  private async transformCart(cart: CartEntity, tenantId: string): Promise<any> {
    this.logger.log(`${this.transformCart.name} Service Called`)

    // 1. Fetch dependencies
    const [settings, activePromotions] = await Promise.all([
      this.siteSettingsRepository.findOne({ where: { tenantId } }),
      this.promotionService.findActivePromotions(tenantId),
    ])
    const currency = settings?.currency || 'BDT'

    // 2. Delegate all math to the PricingEngineService (Option 1 + 2)
    const {
      transformedItems,
      subtotal,
      totalDiscount,
      totalTax,
      payable: enginePayable,
    } = this.pricingEngine.calculateCart(cart.items || [], activePromotions)

    // 3. Apply Coupon (async, stays in service layer)
    let couponDiscountAmount = 0
    let isFreeShipping = false
    let payable = enginePayable - totalTax // enginePayable already includes tax, so strip it before coupon deduction

    if (cart.appliedCouponCode) {
      try {
        const validation = await this.couponService.validateCoupon(
          cart.appliedCouponCode,
          payable,
          tenantId,
        )
        if (validation.valid) {
          couponDiscountAmount = validation.discountAmount
          payable -= couponDiscountAmount
          if (validation.coupon.discountType === DiscountType.FREE_SHIPPING) {
            isFreeShipping = true
          }
        }
      } catch (error) {
        this.logger.error(error)
      }
    }

    // 4. Format and return response
    return {
      cart_id: cart.id,
      currency,
      items: transformedItems,
      summary: {
        subtotal,
        offer_discount: totalDiscount,
        coupon_discount: couponDiscountAmount,
        tax: totalTax,
        payable: payable + totalTax,
        is_free_shipping: isFreeShipping,
      },
      appliedCouponCode: cart.appliedCouponCode,
    }
  }

  async addToCart(
    userId: string,
    tenantId: string,
    createCartItemDto: CreateCartItemDto,
  ): Promise<any> {
    this.logger.log(`${this.addToCart.name} Service Called`)
    const cart = await this.findOrCreateCart(userId, tenantId)
    let { productId, variantId, quantity } = createCartItemDto

    // If variantId is not provided, check if the product has variants and pick the first one
    if (!variantId) {
      const product = await this.productRepository.findOne({
        where: { id: productId, tenantId },
        relations: ['variants'],
      })

      if (product && product.variants && product.variants.length > 0) {
        variantId = product.variants[0].id
      }
    }

    // Check if item already exists in cart using raw entity items
    let cartItem = (cart.items || []).find((item) => {
      const sameProduct = item.productId === productId
      const sameVariant = (item.variantId || null) === (variantId || null)
      return sameProduct && sameVariant
    })

    if (cartItem) {
      cartItem.quantity = Number(cartItem.quantity) + Number(quantity)
      await this.cartItemRepository.save(cartItem)
    } else {
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity: Number(quantity),
        tenantId,
      })
      await this.cartItemRepository.save(cartItem)
    }

    // Return transformed cart
    return this.createOrGetCart(userId, tenantId)
  }

  async updateCartItem(
    userId: string,
    tenantId: string,
    cartItemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<any> {
    this.logger.log(`${this.updateCartItem.name} Service Called`)
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, tenantId },
      relations: ['cart'],
    })

    if (!cartItem) {
      throw new NotFoundException('Cart item not found')
    }

    if (cartItem.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found in user cart')
    }

    cartItem.quantity = updateCartItemDto.quantity
    await this.cartItemRepository.save(cartItem)

    return this.createOrGetCart(userId, tenantId)
  }

  async removeFromCart(userId: string, tenantId: string, cartItemId: string): Promise<any> {
    this.logger.log(`${this.removeFromCart.name} Service Called`)
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, tenantId },
      relations: ['cart'],
    })

    if (!cartItem) {
      throw new NotFoundException('Cart item not found')
    }

    if (cartItem.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found in user cart')
    }

    await this.cartItemRepository.remove(cartItem)

    return this.createOrGetCart(userId, tenantId)
  }

  async clearCart(userId: string, tenantId: string): Promise<void> {
    this.logger.log(`${this.clearCart.name} Service Called`)
    const cart = await this.findOrCreateCart(userId, tenantId)
    await this.cartItemRepository.remove(cart.items)
  }

  async syncCart(userId: string, tenantId: string, items: CreateCartItemDto[]): Promise<any> {
    this.logger.log(`${this.syncCart.name} Service Called`)
    const cart = await this.findOrCreateCart(userId, tenantId)

    // Clear existing items
    if (cart.items && cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items)
      cart.items = [] // Reset locally
    }

    // Add new items
    for (const item of items) {
      let { productId, variantId, quantity } = item

      // If variantId is not provided, check if the product has variants and pick the first one
      if (!variantId) {
        const product = await this.productRepository.findOne({
          where: { id: productId, tenantId },
          relations: ['variants'],
        })

        if (product && product.variants && product.variants.length > 0) {
          variantId = product.variants[0].id
        }
      }

      const cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity: Number(quantity),
        tenantId,
      })
      await this.cartItemRepository.save(cartItem)
    }

    return this.createOrGetCart(userId, tenantId)
  }

  async applyCoupon(userId: string, tenantId: string, code: string): Promise<any> {
    this.logger.log(`${this.applyCoupon.name} Service Called`)
    const cart = await this.findOrCreateCart(userId, tenantId)

    // Calculate current subtotal/payable before coupon to validate it
    const currentCart = await this.transformCart(cart, tenantId)
    const payableBeforeCoupon = currentCart.summary.payable + currentCart.summary.coupon_discount

    // Validates and throws error if invalid
    await this.couponService.validateCoupon(code, payableBeforeCoupon, tenantId)

    cart.appliedCouponCode = code.toUpperCase()
    await this.cartRepository.save(cart)

    return this.createOrGetCart(userId, tenantId)
  }

  async removeCoupon(userId: string, tenantId: string): Promise<any> {
    this.logger.log(`${this.removeCoupon.name} Service Called`)
    const cart = await this.findOrCreateCart(userId, tenantId)
    cart.appliedCouponCode = null
    await this.cartRepository.save(cart)

    return this.createOrGetCart(userId, tenantId)
  }
}
