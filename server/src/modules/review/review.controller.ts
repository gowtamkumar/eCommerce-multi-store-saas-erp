import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { FilterReviewDto } from './dto/filter-review.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Post()
    async create(@Body() dto: CreateReviewDto, @TenantId() tenantId: string) {
        return await this.reviewService.create(dto, tenantId);
    }

    @Get()
    async findAll(@Query() filterDto: FilterReviewDto, @TenantId() tenantId: string) {
        const { reviews, total } = await this.reviewService.findAll(filterDto, tenantId);
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
    async findPublic(@TenantId() tenantId: string) {
        return await this.reviewService.findPublic(tenantId);
    }

    @Get('product/:productId')
    async findByProduct(@Param('productId') productId: string, @TenantId() tenantId: string) {
        return await this.reviewService.findByProduct(productId, tenantId);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateReviewDto, @TenantId() tenantId: string) {
        return await this.reviewService.update(id, dto, tenantId);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.reviewService.remove(id, tenantId);
    }
}
