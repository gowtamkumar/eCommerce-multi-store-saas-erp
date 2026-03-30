import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common'
import { FilterReviewDto } from './dto/filter-review.dto'
import { ReviewResponseDto } from './dto/review-response.dto'
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto'
import { ReviewService } from './review.service'

@Controller('reviews')
export class ReviewController {
  private readonly logger = new Logger(ReviewController.name)

  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPPORT,
    UserRole.MARKETING,
    UserRole.USER,
  )
  async createReview(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateReviewDto,
  ): Promise<BaseApiSuccessResponse<ReviewResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createReview.`)
    const result = await this.reviewService.createReview(dto, ctx.tenantId)
    return {
      success: true,
      statusCode: 201,
      message: `Review created successfully`,
      data: result,
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPPORT,
    UserRole.MARKETING,
    UserRole.OPERATOR,
  )
  async findAllReviews(
    @RequestContext() ctx: RequestContextDto,
    @Query() filterDto: FilterReviewDto,
  ): Promise<BaseApiSuccessResponse<ReviewResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllReviews.`)
    const { reviews, total } = await this.reviewService.findAllReviews(filterDto, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: `List of reviews`,
      data: reviews,
      pagination: {
        total,
        page: filterDto.page,
        limit: filterDto.limit,
        totalPages: Math.ceil(total / filterDto.limit),
      },
    }
  }

  @Get('public')
  async findPublicReviews(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<ReviewResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findPublicReviews.`)
    const result = await this.reviewService.findPublicReviews(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: `Public reviews retrieved`,
      data: result,
    }
  }

  @Get('product/:productId')
  async findByProductReviews(
    @RequestContext() ctx: RequestContextDto,
    @Param('productId') productId: string,
  ): Promise<BaseApiSuccessResponse<ReviewResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findByProductReviews.`)
    const result = await this.reviewService.findByProductReviews(productId, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: `Reviews for product ID ${productId}`,
      data: result,
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT)
  async updateReview(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<BaseApiSuccessResponse<ReviewResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateReview.`)
    const result = await this.reviewService.updateReview(id, dto, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: `Review updated successfully`,
      data: result,
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async removeReview(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeReview.`)
    const result = await this.reviewService.removeReview(id, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: result.message || `Review deleted successfully`,
      data: null,
    }
  }
}
