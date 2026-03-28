import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ReviewRepository } from './review.repository'
import { ReviewStatus } from '@/common/enums/review-status.enum'
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto'
import { ReviewEntity } from './entities/review.entity'

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name)

  constructor(
    private readonly reviewRepository: ReviewRepository,
  ) {}

  async createReview(dto: CreateReviewDto, tenantId: string) {
    this.logger.log(`${this.createReview.name} Service Called`)
    const review = this.reviewRepository.create({ ...dto, tenantId })
    return await this.reviewRepository.save(review)
  }

  async findAllReviews(filterDto: any, tenantId: string) {
    this.logger.log(`${this.findAllReviews.name} Service Called`)
    const { page, limit, q, status } = filterDto
    const query = this.reviewRepository
      .createQueryBuilder('review')
      .where('review.tenantId = :tenantId', { tenantId })

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

  async findPublicReviews(tenantId: string) {
    this.logger.log(`${this.findPublicReviews.name} Service Called`)
    return await this.reviewRepository.find({
      where: { tenantId, status: ReviewStatus.APPROVED },
      order: { createdAt: 'DESC' },
    })
  }

  async findByProductReviews(productId: string, tenantId: string) {
    this.logger.log(`${this.findByProductReviews.name} Service Called`)
    return await this.reviewRepository.find({
      where: { productId, tenantId },
      order: { createdAt: 'DESC' },
    })
  }

  async updateReview(id: string, dto: UpdateReviewDto, tenantId: string) {
    this.logger.log(`${this.updateReview.name} Service Called`)
    const review = await this.reviewRepository.findOne({ where: { id, tenantId } })
    if (!review) throw new NotFoundException('Review not found')
    Object.assign(review, dto)
    return await this.reviewRepository.save(review)
  }

  async removeReview(id: string, tenantId: string) {
    this.logger.log(`${this.removeReview.name} Service Called`)
    const review = await this.reviewRepository.findOne({ where: { id, tenantId } })
    if (!review) throw new NotFoundException('Review not found')
    await this.reviewRepository.remove(review)
    return { success: true }
  }

  // async findAllReviews() {
  //     this.logger.log(`${this.findAllReviews.name} Service Called`);
  //   return await this.reviewRepository.find({
  //     order: { createdAt: 'DESC' },
  //   })
  // }
}
