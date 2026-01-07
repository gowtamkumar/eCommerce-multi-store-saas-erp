import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { ReviewService } from '../review/review.service';

@ApiTags('Products')
@Controller('products')
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly reviewService: ReviewService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new product' })
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    async create(
        @Body() createProductDto: CreateProductDto,
        @TenantId() tenantId: string,
    ) {
        return await this.productService.create(createProductDto, tenantId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products for tenant' })
    @ApiResponse({ status: 200, description: 'Returns all products' })
    async findAll(@Query() filterDto: FilterProductDto, @TenantId() tenantId: string) {
        const { products, total } = await this.productService.findAll(filterDto, tenantId);
        return {
            success: true,
            statusCode: 200,
            data: {
                products,
                pagination: {
                    total,
                    page: filterDto.page,
                    limit: filterDto.limit,
                    totalPages: Math.ceil(total / filterDto.limit),
                },
            },
        };
    }

    @Get('latest')
    @ApiOperation({ summary: 'Get latest products' })
    @ApiResponse({ status: 200, description: 'Returns latest products' })
    async findLatest(
        @TenantId() tenantId: string,
        @Query('limit') limit?: number,
    ) {
        return await this.productService.findLatest(tenantId, limit);
    }

    @Get('slug/:slug')
    @ApiOperation({ summary: 'Get product by slug' })
    @ApiResponse({ status: 200, description: 'Returns product' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async findBySlug(
        @Param('slug') slug: string,
        @TenantId() tenantId: string,
    ) {
        return await this.productService.findBySlug(slug, tenantId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get product by ID' })
    @ApiResponse({ status: 200, description: 'Returns product' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.productService.findOne(id, tenantId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update product' })
    @ApiResponse({ status: 200, description: 'Product updated successfully' })
    async update(
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
        @TenantId() tenantId: string,
    ) {
        return await this.productService.update(id, updateProductDto, tenantId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete product' })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    async remove(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.productService.remove(id, tenantId);
    }

    @Get(':id/reviews')
    @ApiOperation({ summary: 'Get reviews for a specific product' })
    @ApiResponse({ status: 200, description: 'Returns product reviews' })
    async getReviews(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.reviewService.findByProduct(id, tenantId);
    }
}
