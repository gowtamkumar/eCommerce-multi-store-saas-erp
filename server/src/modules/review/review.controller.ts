import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FilterReviewDto } from './dto/filter-review.dto';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createReview(@Body() dto: CreateReviewDto, @TenantId() tenantId: string) {
        return await this.reviewService.createReview(dto, tenantId);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAllReviews(@Query() filterDto: FilterReviewDto, @TenantId() tenantId: string) {
        const { reviews, total } = await this.reviewService.findAllReviews(filterDto, tenantId);
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
    async findPublicReviews(@TenantId() tenantId: string) {
        return await this.reviewService.findPublicReviews(tenantId);
    }

    @Get('product/:productId')
    async findByProductReviews(@Param('productId') productId: string, @TenantId() tenantId: string) {
        return await this.reviewService.findByProductReviews(productId, tenantId);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updateReview(@Param('id') id: string, @Body() dto: UpdateReviewDto, @TenantId() tenantId: string) {
        return await this.reviewService.updateReview(id, dto, tenantId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async removeReview(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.reviewService.removeReview(id, tenantId);
    }
}
