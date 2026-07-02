import { BaseStoreRepository } from '@/common/base-repository'
import { ReviewStatus } from '@/common/enums/review-status.enum'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ReviewEntity } from '../entities/review.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class ReviewRepository extends BaseStoreRepository<ReviewEntity> {
  constructor(
    @InjectRepository(ReviewEntity)
    repo: Repository<ReviewEntity>,
  ) {
    super(ReviewEntity, repo)
}

  async findAllWithFilters(
    filterDto: any,
    storeId: string,
  ): Promise<{ reviews: ReviewEntity[]; total: number }> {
    const { page, limit, q, status } = filterDto
    const query = this.repo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.product', 'product')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.storeId = :storeId', { storeId })

    if (status) {
      query.andWhere('review.status = :status', { status })
    }

    if (q) {
      query.andWhere('(user.name ILIKE :q OR review.comment ILIKE :q OR product.name ILIKE :q)', {
        q: `%${q}%`,
      })
    }

    const [reviews, total] = await query
      .orderBy('review.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return { reviews, total }
  }

  async findPublicReviews(storeId: string): Promise<ReviewEntity[]> {
    return this.repo.find({
      where: { storeId, status: ReviewStatus.APPROVED },
      relations: {
        user: true,
      },
      order: { createdAt: 'DESC' },
    })
  }

  async findByProductReviews(productId: string, storeId: string): Promise<ReviewEntity[]> {
    return this.repo.find({
      where: { productId, storeId },
      relations: {
        user: true,
      },
      order: { createdAt: 'DESC' },
    })
  }

  async findById(id: string, storeId: string): Promise<ReviewEntity | null> {
    return this.repo.findOne({ where: { id, storeId } })
  }

  async findByIdWithRelations(id: string, storeId: string): Promise<ReviewEntity | null> {
    return this.repo.findOne({
      where: { id, storeId },
      relations: {
        product: true,
        user: true,
      },
    })
  }

  async createAndSave(dto: any, ctx: RequestContextDto): Promise<ReviewEntity> {
    const review = this.repo.create({
      ...dto,
      storeId: ctx.storeId,
      userId: ctx.userId,
    } as ReviewEntity)
    return this.repo.save(review)
  }

  async updateAndSave(review: ReviewEntity, dto: any): Promise<ReviewEntity> {
    Object.assign(review, dto)
    return this.repo.save(review)
  }

  async removeReview(review: ReviewEntity): Promise<void> {
    await this.repo.softRemove(review)
  }
}
