import { RequestContextDto } from '@/common/dto/request-context.dto'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateReviewDto, UpdateReviewDto } from '../dto/review.dto'
import { ReviewEntity } from '../entities/review.entity'
import { ReviewRepository } from '../repositoris/review.repository'

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name)

  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly cacheService: CacheService,
    private readonly notificationService: NotificationService,
  ) {}

  async createReview(dto: CreateReviewDto, ctx: RequestContextDto): Promise<ReviewEntity> {
    this.logger.log(`${this.createReview.name} Service Called`)
    const result = await this.reviewRepository.createAndSave(dto, ctx)

    // Trigger Notification for Admin
    try {
      const review = await this.reviewRepository.findByIdWithRelations(result.id, ctx.tenantId)
      const productName = review?.product?.name || 'Product'
      const reviewerName = review?.user?.name || review?.user?.username || 'A customer'
      const shortComment = dto.comment.length > 50 ? `${dto.comment.substring(0, 50)}...` : dto.comment

      await this.notificationService.createNotification({
        title: 'New Product Review Pending Moderation',
        message: `${reviewerName} rated "${productName}" ${dto.rating} stars: "${shortComment}"`,
        type: 'INFO',
        link: '/admin/reviews',
        userId: null as any, // Send to all admins
      }, ctx.tenantId)
    } catch (e) {
      this.logger.error(`Failed to trigger product review notification: ${e.message}`)
    }

    await this.cacheService.delCache(`reviews:product:${dto.productId}`, ctx.tenantId)
    await this.cacheService.delCache('reviews:public', ctx.tenantId)
    return result
  }

  async findAllReviews(
    filterDto: any,
    ctx: RequestContextDto,
  ): Promise<{ reviews: ReviewEntity[]; total: number }> {
    this.logger.log(`${this.findAllReviews.name} Service Called`)
    const tenantId = ctx.tenantId
    return await this.reviewRepository.findAllWithFilters(filterDto, tenantId)
  }

  async findPublicReviews(ctx: RequestContextDto): Promise<ReviewEntity[]> {
    this.logger.log(`${this.findPublicReviews.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = 'reviews:public'
    return this.cacheService.rememberCache(
      cacheKey,
      () => this.reviewRepository.findPublicReviews(tenantId),
      300,
      tenantId,
    )
  }

  async findByProductReviews(productId: string, ctx: RequestContextDto): Promise<ReviewEntity[]> {
    this.logger.log(`${this.findByProductReviews.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = `reviews:product:${productId}`
    return this.cacheService.rememberCache(
      cacheKey,
      () => this.reviewRepository.findByProductReviews(productId, tenantId),
      300,
      tenantId,
    )
  }

  async updateReview(
    id: string,
    dto: UpdateReviewDto,
    ctx: RequestContextDto,
  ): Promise<ReviewEntity> {
    this.logger.log(`${this.updateReview.name} Service Called`)
    const tenantId = ctx.tenantId
    const review = await this.reviewRepository.findById(id, tenantId)
    if (!review) throw new NotFoundException('Review not found')

    const result = await this.reviewRepository.updateAndSave(review, dto)
    await this.cacheService.delCache(`reviews:product:${review.productId}`, tenantId)
    await this.cacheService.delCache('reviews:public', tenantId)
    return result
  }

  async removeReview(
    id: string,
    ctx: RequestContextDto,
  ): Promise<{ success: boolean; message?: string }> {
    this.logger.log(`${this.removeReview.name} Service Called`)
    const tenantId = ctx.tenantId
    const review = await this.reviewRepository.findById(id, tenantId)
    if (!review) throw new NotFoundException('Review not found')

    await this.reviewRepository.removeReview(review)
    await this.cacheService.delCache(`reviews:product:${review.productId}`, tenantId)
    await this.cacheService.delCache('reviews:public', tenantId)
    return { success: true, message: 'Review deleted successfully' }
  }
}
