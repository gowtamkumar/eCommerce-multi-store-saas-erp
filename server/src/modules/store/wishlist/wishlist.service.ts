import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { WishlistRepository } from './wishlist.repository'
import { WishlistEntity } from './entities/wishlist.entity'
import { ProductRepository } from '@/modules/admin/catalog/product/product.repository'

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name)

  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async toggleWishlist(
    userId: string,
    productId: string,
    tenantId: string,
  ): Promise<{ added: boolean }> {
    this.logger.log(`${this.toggleWishlist.name} Service Called for user ${userId}`)

    // Check if product exists
    const product = await this.productRepository.findOne({ where: { id: productId, tenantId } })
    if (!product) {
      throw new NotFoundException('Product not found')
    }

    const added = await this.wishlistRepository.toggleWishlist(userId, productId, tenantId)
    return { added }
  }

  async getWishlist(userId: string, tenantId: string): Promise<WishlistEntity[]> {
    this.logger.log(`${this.getWishlist.name} Service Called for user ${userId}`)
    return await this.wishlistRepository.findByUserId(userId, tenantId)
  }

  async clearWishlist(userId: string, tenantId: string): Promise<void> {
    this.logger.log(`${this.clearWishlist.name} Service Called for user ${userId}`)
    await this.wishlistRepository.clearWishlist(userId, tenantId)
  }

  async removeFromWishlist(userId: string, productId: string, tenantId: string): Promise<void> {
    this.logger.log(`${this.removeFromWishlist.name} Service Called for user ${userId}`)
    const item = await this.wishlistRepository.findByUserAndProduct(userId, productId, tenantId)
    if (item) {
      await this.wishlistRepository.remove(item)
    }
  }
}
