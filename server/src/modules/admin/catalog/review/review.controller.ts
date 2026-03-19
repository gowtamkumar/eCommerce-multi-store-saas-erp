import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { FilterReviewDto } from './dto/filter-review.dto';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { ReviewService } from './review.service';
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";

@Controller('reviews')
export class ReviewController {
    private readonly logger = new Logger(ReviewController.name);

    constructor(private readonly reviewService: ReviewService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createReview(@RequestContext() ctx: RequestContextDto, @Body() dto: CreateReviewDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createReview.`);
        return await this.reviewService.createReview(dto, ctx.tenantId);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAllReviews(@RequestContext() ctx: RequestContextDto, @Query() filterDto: FilterReviewDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllReviews.`);
        const { reviews, total } = await this.reviewService.findAllReviews(filterDto, ctx.tenantId);
        return {
            success: true,
            statusCode: 200,
            data: {
                reviews,
                pagination: {
                    total,
                    page: filterDto.page,
                    limit: filterDto.limit,
                    totalPages: Math.ceil(total / filterDto.limit),
                },
            },
        };
    }

    @Get('public')
    async findPublicReviews(@RequestContext() ctx: RequestContextDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findPublicReviews.`);
        return await this.reviewService.findPublicReviews(ctx.tenantId);
    }

    @Get('product/:productId')
    async findByProductReviews(@RequestContext() ctx: RequestContextDto, @Param('productId') productId: string) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findByProductReviews.`);
        return await this.reviewService.findByProductReviews(productId, ctx.tenantId);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updateReview(@RequestContext() ctx: RequestContextDto, @Param('id') id: string, @Body() dto: UpdateReviewDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateReview.`);
        return await this.reviewService.updateReview(id, dto, ctx.tenantId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async removeReview(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeReview.`);
        return await this.reviewService.removeReview(id, ctx.tenantId);
    }
}
