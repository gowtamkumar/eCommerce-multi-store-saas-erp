import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WishlistEntity } from './entities/wishlist.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class WishlistRepository {
  constructor(
    @InjectRepository(WishlistEntity)
    private readonly repo: Repository<WishlistEntity>,
  ) {}

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
      relations: {
        product: {
          variants: true,
          category: true,
        },
      },
      order: { createdAt: 'DESC' },
    })
  }

  async clearWishlist(userId: string, tenantId: string): Promise<void> {
    await this.repo.delete({ userId, tenantId })
  }
  async deleteWishlistItem(userId: string, productId: string, tenantId: string): Promise<void> {
    // Direct delete: the unique index on (userId, productId, tenantId) makes this safe
    // and atomic without a prior SELECT — halves the DB round trips vs findOne+remove
    await this.repo.delete({ userId, productId, tenantId })
  }

  async toggleWishlist(productId: string, ctx: RequestContextDto): Promise<boolean> {
    const userId = ctx.userId
    const tenantId = ctx.tenantId
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
