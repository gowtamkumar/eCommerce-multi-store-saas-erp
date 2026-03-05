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
    async create(@Body() dto: CreateReviewDto, @TenantId() tenantId: string) {
        return await this.reviewService.create(dto, tenantId);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
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
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() dto: UpdateReviewDto, @TenantId() tenantId: string) {
        return await this.reviewService.update(id, dto, tenantId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.reviewService.remove(id, tenantId);
    }
}
