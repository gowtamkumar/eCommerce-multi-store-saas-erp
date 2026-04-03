import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WishlistEntity } from './entities/wishlist.entity'

@Injectable()
export class WishlistRepository {
  constructor(
    @InjectRepository(WishlistEntity)
    private readonly repo: Repository<WishlistEntity>,
  ) { }

  async findByUserAndProduct(
    userId: string,
    productId: string,
    tenantId: string,
  ): Promise<WishlistEntity | null> {
    return this.repo.findOne({
      where: { userId, productId, tenantId },
    })
  }

  async findByUserId(userId: string, tenantId: string): Promise<WishlistEntity[]> {
    return this.repo.find({
      where: { userId, tenantId },
      relations: ['product', 'product.variants', 'product.category'],
      order: { createdAt: 'DESC' },
    })
  }

  async clearWishlist(userId: string, tenantId: string): Promise<void> {
    await this.repo.delete({ userId, tenantId })
  }

  async toggleWishlist(userId: string, productId: string, tenantId: string): Promise<boolean> {
    const existing = await this.findByUserAndProduct(userId, productId, tenantId)
    if (existing) {
      await this.repo.remove(existing)
      return false // Removed
    } else {
      const newItem = this.repo.create({ userId, productId, tenantId })
      await this.repo.save(newItem)
      return true // Added
    }
  }

}
