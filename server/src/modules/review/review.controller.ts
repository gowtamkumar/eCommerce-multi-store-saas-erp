import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { FilterReviewDto } from './dto/filter-review.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Post()
    @ApiOperation({ summary: 'Create review' })
    async create(@Body() dto: CreateReviewDto, @TenantId() tenantId: string) {
        return await this.reviewService.create(dto, tenantId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all reviews with pagination' })
    @ApiResponse({ status: 200, description: 'Returns paginated reviews' })
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
    @ApiOperation({ summary: 'Get approved reviews' })
    async findPublic(@TenantId() tenantId: string) {
        return await this.reviewService.findPublic(tenantId);
    }

    @Get('product/:productId')
    @ApiOperation({ summary: 'Get product reviews' })
    async findByProduct(@Param('productId') productId: string, @TenantId() tenantId: string) {
        return await this.reviewService.findByProduct(productId, tenantId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update review status' })
    async update(@Param('id') id: string, @Body() dto: UpdateReviewDto, @TenantId() tenantId: string) {
        return await this.reviewService.update(id, dto, tenantId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete review' })
    async remove(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.reviewService.remove(id, tenantId);
    }
}
