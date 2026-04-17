import { ReviewStatus } from '@/common/enums/review-status.enum'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ReviewEntity } from '../entities/review.entity'

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly repo: Repository<ReviewEntity>,
  ) { }

  async findAllWithFilters(
    filterDto: any,
    tenantId: string,
  ): Promise<{ reviews: ReviewEntity[]; total: number }> {
    const { page, limit, q, status } = filterDto
    const query = this.repo.createQueryBuilder('review')
      .leftJoinAndSelect('review.product', 'product')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.tenantId = :tenantId', { tenantId })

    if (status) {
      query.andWhere('review.status = :status', { status })
    }

    if (q) {
      query.andWhere('(user.name ILIKE :q OR review.comment ILIKE :q OR product.name ILIKE :q)', { q: `%${q}%` })
    }

    const [reviews, total] = await query
      .orderBy('review.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return { reviews, total }
  }

  async findPublicReviews(tenantId: string): Promise<ReviewEntity[]> {
    return this.repo.find({
      where: { tenantId, status: ReviewStatus.APPROVED },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    })
  }

  async findByProductReviews(productId: string, tenantId: string): Promise<ReviewEntity[]> {
    return this.repo.find({
      where: { productId, tenantId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    })
  }

  async findById(id: string, tenantId: string): Promise<ReviewEntity | null> {
    return this.repo.findOne({ where: { id, tenantId } })
  }

  async createAndSave(dto: any, tenantId: string): Promise<ReviewEntity> {
    const review = this.repo.create({ ...dto, tenantId } as ReviewEntity)
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
