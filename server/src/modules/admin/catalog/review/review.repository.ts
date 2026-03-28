import { ReviewStatus } from '@/common/enums/review-status.enum'
import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { ReviewEntity } from './entities/review.entity'

@Injectable()
export class ReviewRepository extends Repository<ReviewEntity> {
  constructor(private dataSource: DataSource) {
    super(ReviewEntity, dataSource.createEntityManager())
  }

  async findAllWithFilters(
    filterDto: any,
    tenantId: string,
  ): Promise<{ reviews: ReviewEntity[]; total: number }> {
    const { page, limit, q, status } = filterDto
    const query = this.createQueryBuilder('review').where('review.tenantId = :tenantId', {
      tenantId,
    })

    if (status) {
      query.andWhere('review.status = :status', { status })
    }

    if (q) {
      query.andWhere('(review.customerName ILIKE :q OR review.comment ILIKE :q)', { q: `%${q}%` })
    }

    const [reviews, total] = await query
      .orderBy('review.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return { reviews, total }
  }

  async findPublicReviews(tenantId: string): Promise<ReviewEntity[]> {
    return this.find({
      where: { tenantId, status: ReviewStatus.APPROVED },
      order: { createdAt: 'DESC' },
    })
  }

  async findByProductReviews(productId: string, tenantId: string): Promise<ReviewEntity[]> {
    return this.find({
      where: { productId, tenantId },
      order: { createdAt: 'DESC' },
    })
  }

  async findById(id: string, tenantId: string): Promise<ReviewEntity | null> {
    return this.findOne({ where: { id, tenantId } })
  }

  async createAndSave(dto: any, tenantId: string): Promise<ReviewEntity> {
    const review = this.create({ ...dto, tenantId } as ReviewEntity)
    return this.save(review)
  }

  async updateAndSave(review: ReviewEntity, dto: any): Promise<ReviewEntity> {
    Object.assign(review, dto)
    return this.save(review)
  }

  async removeReview(review: ReviewEntity): Promise<void> {
    await this.remove(review)
  }
}
