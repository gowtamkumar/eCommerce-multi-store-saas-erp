import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { WishlistRepository } from './wishlist.repository'
import { ProductRepository } from '@/modules/admin/catalog/product/repositories/product.repository'
import { PricingEngineService } from '@/common/services/pricing-engine.service'
import { PromotionService } from '@/modules/admin/sales/promotion/promotion.service'

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name)

  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly productRepository: ProductRepository,
    private readonly pricingEngine: PricingEngineService,
    private readonly promotionService: PromotionService,
  ) { }

  async toggleWishlist(
    userId: string,
    productId: string,
    tenantId: string,
  ): Promise<{ added: boolean }> {
    this.logger.log(`${this.toggleWishlist.name} Service Called for user ${userId}`)

    // Check if product exists
    const product = await this.productRepository.findByIdWithRelations(productId, tenantId)
    if (!product) {
      throw new NotFoundException('Product not found')
    }

    const added = await this.wishlistRepository.toggleWishlist(userId, productId, tenantId)
    return { added }
  }

  async getWishlist(userId: string, tenantId: string): Promise<any[]> {
    this.logger.log(`${this.getWishlist.name} Service Called for user ${userId}`)
    const items = await this.wishlistRepository.findByUserId(userId, tenantId)

    const activePromotions = await this.promotionService.findActivePromotions(tenantId)

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

  async clearWishlist(userId: string, tenantId: string): Promise<void> {
    this.logger.log(`${this.clearWishlist.name} Service Called for user ${userId}`)
    await this.wishlistRepository.clearWishlist(userId, tenantId)
  }

  async removeFromWishlist(userId: string, productId: string, tenantId: string): Promise<void> {
    this.logger.log(`${this.removeFromWishlist.name} Service Called for user ${userId}`)
    await this.wishlistRepository.deleteWishlistItem(userId, productId, tenantId)
  }
}
