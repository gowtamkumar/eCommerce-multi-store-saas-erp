import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { TenantId } from '../../common/decorators/tenant-id.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CreateReviewDto } from '../review/dto/review.dto'
import { ReviewService } from '../review/review.service'
import { CreateProductDto } from './dto/create-product.dto'
import { FilterProductDto } from './dto/filter-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductService } from './product.service'

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly reviewService: ReviewService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createProductDto: CreateProductDto, @TenantId() tenantId: string) {
    return await this.productService.create(createProductDto, tenantId)
  }

  @Get()
  async findAll(@Query() filterDto: FilterProductDto, @TenantId() tenantId: string) {
    const { products, total } = await this.productService.findAll(filterDto, tenantId)
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
    }
  }

  @Get('latest')
  async findLatest(@TenantId() tenantId: string, @Query('limit') limit?: number) {
    return await this.productService.findLatest(tenantId, limit)
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string, @TenantId() tenantId: string) {
    return await this.productService.findBySlug(slug, tenantId)
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.productService.findOne(id, tenantId)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @TenantId() tenantId: string,
  ) {
    return await this.productService.update(id, updateProductDto, tenantId)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.productService.remove(id, tenantId)
  }

  @Get(':id/reviews')
  async getReviews(@Param('id') id: string, @TenantId() tenantId: string) {
    return await this.reviewService.findByProduct(id, tenantId)
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Param('id') productId: string,
    @Body() createReviewDto: CreateReviewDto,
    @TenantId() tenantId: string,
  ) {
    // Ensure the productId in the body matches the URL param
    createReviewDto.productId = productId
    return await this.reviewService.create(createReviewDto, tenantId)
  }
}
