import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { WishlistEntity } from './entities/wishlist.entity'

@Injectable()
export class WishlistRepository extends Repository<WishlistEntity> {
  constructor(private dataSource: DataSource) {
    super(WishlistEntity, dataSource.createEntityManager())
  }

  async findByUserAndProduct(
    userId: string,
    productId: string,
    tenantId: string,
  ): Promise<WishlistEntity | null> {
    return this.findOne({
      where: { userId, productId, tenantId },
    })
  }

  async findByUserId(userId: string, tenantId: string): Promise<WishlistEntity[]> {
    return this.find({
      where: { userId, tenantId },
      relations: ['product', 'product.variants', 'product.category'],
      order: { createdAt: 'DESC' },
    })
  }

  async clearWishlist(userId: string, tenantId: string): Promise<void> {
    await this.delete({ userId, tenantId })
  }

  async toggleWishlist(userId: string, productId: string, tenantId: string): Promise<boolean> {
    const existing = await this.findByUserAndProduct(userId, productId, tenantId)
    if (existing) {
      await this.remove(existing)
      return false // Removed
    } else {
      const newItem = this.create({ userId, productId, tenantId })
      await this.save(newItem)
      return true // Added
    }
  }
}
