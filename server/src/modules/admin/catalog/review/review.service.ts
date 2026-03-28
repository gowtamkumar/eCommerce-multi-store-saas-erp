import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto'
import { ReviewRepository } from './review.repository'

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name)

  constructor(private readonly reviewRepository: ReviewRepository) {}

  async createReview(dto: CreateReviewDto, tenantId: string) {
    this.logger.log(`${this.createReview.name} Service Called`)
    return await this.reviewRepository.createAndSave(dto, tenantId)
  }

  async findAllReviews(filterDto: any, tenantId: string) {
    this.logger.log(`${this.findAllReviews.name} Service Called`)
    return await this.reviewRepository.findAllWithFilters(filterDto, tenantId)
  }

  async findPublicReviews(tenantId: string) {
    this.logger.log(`${this.findPublicReviews.name} Service Called`)
    return await this.reviewRepository.findPublicReviews(tenantId)
  }

  async findByProductReviews(productId: string, tenantId: string) {
    this.logger.log(`${this.findByProductReviews.name} Service Called`)
    return await this.reviewRepository.findByProductReviews(productId, tenantId)
  }

  async updateReview(id: string, dto: UpdateReviewDto, tenantId: string) {
    this.logger.log(`${this.updateReview.name} Service Called`)
    const review = await this.reviewRepository.findById(id, tenantId)
    if (!review) throw new NotFoundException('Review not found')

    return await this.reviewRepository.updateAndSave(review, dto)
  }

  async removeReview(id: string, tenantId: string) {
    this.logger.log(`${this.removeReview.name} Service Called`)
    const review = await this.reviewRepository.findById(id, tenantId)
    if (!review) throw new NotFoundException('Review not found')

    await this.reviewRepository.removeReview(review)
    return { success: true }
  }
}
