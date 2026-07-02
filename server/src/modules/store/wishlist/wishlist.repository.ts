import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WishlistEntity } from './entities/wishlist.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class WishlistRepository extends BaseStoreRepository<WishlistEntity> {
  constructor(
    @InjectRepository(WishlistEntity)
    repo: Repository<WishlistEntity>,
  ) {
    super(WishlistEntity, repo)
}

  async findByUserAndProduct(
    userId: string,
    productId: string,
    storeId: string,
  ): Promise<WishlistEntity | null> {
    return this.repo.findOne({
      where: { userId, productId, storeId },
    })
  }

  async findByUserId(userId: string, storeId: string): Promise<WishlistEntity[]> {
    return this.repo.find({
      where: { userId, storeId },
      relations: {
        product: {
          variants: true,
          category: true,
        },
      },
      order: { createdAt: 'DESC' },
    })
  }

  async clearWishlist(userId: string, storeId: string): Promise<void> {
    await this.repo.delete({ userId, storeId })
  }
  async deleteWishlistItem(userId: string, productId: string, storeId: string): Promise<void> {
    // Direct delete: the unique index on (userId, productId, storeId) makes this safe
    // and atomic without a prior SELECT — halves the DB round trips vs findOne+remove
    await this.repo.delete({ userId, productId, storeId })
  }

  async toggleWishlist(productId: string, ctx: RequestContextDto): Promise<boolean> {
    const userId = ctx.userId
    const storeId = ctx.storeId
    const existing = await this.findByUserAndProduct(userId, productId, storeId)
    if (existing) {
      await this.repo.remove(existing)
      return false // Removed
    } else {
      const newItem = this.repo.create({ userId, productId, storeId })
      await this.repo.save(newItem)
      return true // Added
    }
  }
}
