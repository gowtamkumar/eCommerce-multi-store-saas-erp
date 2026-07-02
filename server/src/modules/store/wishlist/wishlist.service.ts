import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { WishlistRepository } from './wishlist.repository'
import { ProductRepository } from '@/modules/admin/catalog/product/repositories/product.repository'
import { PricingEngineService } from '@/common/services/pricing-engine.service'
import { PromotionService } from '@/modules/admin/sales/promotion/services/promotion.service'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name)

  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly productRepository: ProductRepository,
    private readonly pricingEngine: PricingEngineService,
    private readonly promotionService: PromotionService,
  ) {}

  async toggleWishlist(ctx: RequestContextDto, productId: string): Promise<{ added: boolean }> {
    const { userId, storeId } = ctx
    this.logger.log(`${this.toggleWishlist.name} Service Called for user ${userId}`)

    // Check if product exists
    const product = await this.productRepository.findByIdWithRelations(productId, storeId)
    if (!product) {
      throw new NotFoundException('Product not found')
    }

    const added = await this.wishlistRepository.toggleWishlist(productId, ctx)
    return { added }
  }

  async getWishlist(ctx: RequestContextDto): Promise<any[]> {
    const { userId, storeId } = ctx
    this.logger.log(`${this.getWishlist.name} Service Called for user ${userId}`)
    const items = await this.wishlistRepository.findByUserId(userId, storeId)

    const activePromotions = await this.promotionService.findActivePromotions(ctx)

    return items.map((item) => {
      const pricingData = this.pricingEngine.calculateItemPricing(
        {
          id: item.id,
          productId: item.productId,
          quantity: 1,
          product: item.product,
        },
        activePromotions,
      )

      return {
        ...item,
        pricing: pricingData.pricing,
      }
    })
  }

  async clearWishlist(ctx: RequestContextDto): Promise<void> {
    const { userId, storeId } = ctx
    this.logger.log(`${this.clearWishlist.name} Service Called for user ${userId}`)
    await this.wishlistRepository.clearWishlist(userId, storeId)
  }

  async removeFromWishlist(ctx: RequestContextDto, productId: string): Promise<void> {
    const { userId, storeId } = ctx
    this.logger.log(`${this.removeFromWishlist.name} Service Called for user ${userId}`)
    await this.wishlistRepository.deleteWishlistItem(userId, productId, storeId)
  }
}
