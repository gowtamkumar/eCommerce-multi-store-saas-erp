import { DiscountType } from '@/common/enums/discount-type.enum'
import { PricingEngineService } from '@/common/services/pricing-engine.service'
import { ProductRepository } from '@/modules/admin/catalog/product/repositories/product.repository'
import { CouponService } from '@/modules/admin/sales/coupon/services/coupon.service'
import { PromotionService } from '@/modules/admin/sales/promotion/services/promotion.service'
import { SiteSettingsRepository } from '@/modules/admin/settings/site-settings.repository'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CartItemRepository } from './cart-item.repository'
import { CartRepository } from './cart.repository'
import { CartResponseDto } from './dto/cart-response.dto'
import { CreateCartItemDto } from './dto/create-cart-item.dto'
import { UpdateCartItemDto } from './dto/update-cart-item.dto'
import { CartEntity } from './entities/cart.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name)

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartItemRepository: CartItemRepository,
    private readonly productRepository: ProductRepository,
    private readonly siteSettingsRepository: SiteSettingsRepository,
    private readonly couponService: CouponService,
    private readonly promotionService: PromotionService,
    private readonly pricingEngine: PricingEngineService,
  ) { }

  async createOrGetCart(ctx: RequestContextDto): Promise<CartResponseDto> {
    this.logger.log(`${this.createOrGetCart.name} Service Called`)
    const cart = await this.findOrCreateCart(ctx)
    return this.transformCart(cart, ctx)
  }

  private async findOrCreateCart(ctx: RequestContextDto): Promise<CartEntity> {
    this.logger.log(`${this.findOrCreateCart.name} Service Called`)
    const tenantId = ctx.tenantId
    const userId = ctx.userId
    let cart = await this.cartRepository.findByUserId(userId, tenantId)

    if (!cart) {
      cart = await this.cartRepository.createAndSave(ctx)
    }

    return cart
  }

  async findAllAdminCarts(
    ctx: RequestContextDto,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ carts: any[]; total: number }> {
    this.logger.log(`${this.findAllAdminCarts.name} Service Called`)
    const tenantId = ctx.tenantId

    const { carts, total } = await this.cartRepository.findAllAdminPaginated(
      tenantId,
      page,
      limit,
      search,
    )

    // We do a lightweight transform here to avoid triggering heavy promotions engine N times
    // We'll just return the cart with summarized item count and rough total
    const summarizedCarts = carts.map((cart) => {
      let totalAmount = 0
      let itemCount = 0

      cart.items?.forEach((item) => {
        itemCount += Number(item.quantity)
        if (item.product) {
          totalAmount += Number(item.product.price) * Number(item.quantity)
        }
      })

      return {
        id: cart.id,
        customerName: cart.user?.name || 'Guest',
        customerEmail: cart.user?.email || '',
        customerPhone: cart.user?.phone || '',
        itemCount,
        totalAmount,
        updatedAt: cart.updatedAt,
        items: cart.items?.map((i) => ({
          productName: i.product?.name,
          quantity: i.quantity,
          basePrice: i.product?.price,
        })),
      }
    })

    return { carts: summarizedCarts, total }
  }

  private async transformCart(cart: CartEntity, ctx: RequestContextDto): Promise<CartResponseDto> {
    this.logger.log(`${this.transformCart.name} Service Called`)
    const tenantId = ctx.tenantId

    // 1. Fetch dependencies
    const [settings, activePromotions] = await Promise.all([
      this.siteSettingsRepository.findByTenantId(tenantId),
      this.promotionService.findActivePromotions(ctx),
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
          ctx,
        )
        if (validation.valid) {
          couponDiscountAmount = validation.discountAmount
          payable -= couponDiscountAmount
          if (
            validation.coupon.discountType === DiscountType.FREE_SHIPPING ||
            (validation.coupon.discountType as any) === 'free_shipping'
          ) {
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
    ctx: RequestContextDto,
    createCartItemDto: CreateCartItemDto,
  ): Promise<CartResponseDto> {
    this.logger.log(`${this.addToCart.name} Service Called`)
    const tenantId = ctx.tenantId
    const cart = await this.findOrCreateCart(ctx)
    let { productId, variantId, quantity } = createCartItemDto

    // If variantId is not provided, check if the product has variants and pick the first one
    if (!variantId) {
      const product = await this.productRepository.findProductById(productId, tenantId)

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
      await this.cartItemRepository.updateQuantity(
        cartItem,
        Number(cartItem.quantity) + Number(quantity),
      )
    } else {
      await this.cartItemRepository.createAndSave(
        {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity: Number(quantity),
        },
        ctx,
      )
    }

    // Return transformed cart
    return this.createOrGetCart(ctx)
  }

  async updateCartItem(
    ctx: RequestContextDto,
    cartItemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    this.logger.log(`${this.updateCartItem.name} Service Called`)
    const tenantId = ctx.tenantId
    const userId = ctx.userId
    const cartItem = await this.cartItemRepository.findByIdWithCart(cartItemId, tenantId)

    if (!cartItem) {
      throw new NotFoundException('Cart item not found')
    }

    if (cartItem.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found in user cart')
    }

    await this.cartItemRepository.updateQuantity(cartItem, updateCartItemDto.quantity)

    return this.createOrGetCart(ctx)
  }

  async removeFromCart(ctx: RequestContextDto, cartItemId: string): Promise<CartResponseDto> {
    this.logger.log(`${this.removeFromCart.name} Service Called`)
    const tenantId = ctx.tenantId
    const userId = ctx.userId
    const cartItem = await this.cartItemRepository.findByIdWithCart(cartItemId, tenantId)

    if (!cartItem) {
      throw new NotFoundException('Cart item not found')
    }

    if (cartItem.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found in user cart')
    }

    await this.cartItemRepository.removeItems(cartItem)

    return this.createOrGetCart(ctx)
  }

  async clearCart(ctx: RequestContextDto): Promise<void> {
    this.logger.log(`${this.clearCart.name} Service Called`)
    const cart = await this.findOrCreateCart(ctx)
    await this.cartItemRepository.removeItems(cart.items)
  }

  async syncCart(ctx: RequestContextDto, items: CreateCartItemDto[]): Promise<CartResponseDto> {
    this.logger.log(`${this.syncCart.name} Service Called`)
    const tenantId = ctx.tenantId
    const cart = await this.findOrCreateCart(ctx)

    // Clear existing items
    if (cart.items && cart.items.length > 0) {
      await this.cartItemRepository.removeItems(cart.items)
      cart.items = []
    }

    // Phase 1: Resolve all variant IDs in PARALLEL (was sequential N+1 loop)
    const resolvedItems = await Promise.all(
      items.map(async (item) => {
        let { productId, variantId, quantity } = item

        if (!variantId) {
          const product = await this.productRepository.findProductById(productId, tenantId)
          if (product?.variants?.length > 0) {
            variantId = product.variants[0].id
          }
        }

        return { productId, variantId: variantId || null, quantity: Number(quantity) }
      }),
    )

    // Phase 2: Persist all resolved items in PARALLEL
    await Promise.all(
      resolvedItems.map((item) =>
        this.cartItemRepository.createAndSave(
          {
            cartId: cart.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          },
          ctx,
        ),
      ),
    )

    return this.createOrGetCart(ctx)
  }

  async applyCoupon(ctx: RequestContextDto, code: string): Promise<CartResponseDto> {
    this.logger.log(`${this.applyCoupon.name} Service Called`)
    const tenantId = ctx.tenantId
    const cart = await this.findOrCreateCart(ctx)

    // Calculate current subtotal/payable before coupon to validate it
    const currentCart = await this.transformCart(cart, ctx)
    const payableBeforeCoupon = currentCart.summary.payable + currentCart.summary.coupon_discount

    // Validates and throws error if invalid
    await this.couponService.validateCoupon(code, payableBeforeCoupon, ctx)

    await this.cartRepository.updateCoupon(cart, code)

    return this.createOrGetCart(ctx)
  }

  async removeCoupon(ctx: RequestContextDto): Promise<CartResponseDto> {
    this.logger.log(`${this.removeCoupon.name} Service Called`)
    const cart = await this.findOrCreateCart(ctx)
    await this.cartRepository.updateCoupon(cart, null)

    return this.createOrGetCart(ctx)
  }
}
