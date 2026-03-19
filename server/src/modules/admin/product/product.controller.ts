import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { RequestContext } from "src/common/decorators/request-context.decorator"
import { RequestContextDto } from "src/common/dto/request-context.dto"
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'
import { CreateReviewDto } from '../review/dto/review.dto'
import { ReviewService } from '../review/review.service'
import { CreateProductDto } from './dto/create-product.dto'
import { FilterProductDto } from './dto/filter-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductService } from './product.service'

@Controller('products')
export class ProductController {
    private readonly logger = new Logger(ProductController.name);

  constructor(
    private readonly productService: ProductService,
    private readonly reviewService: ReviewService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@RequestContext() ctx: RequestContextDto, @Body() createProductDto: CreateProductDto) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called create.`);
      return await this.productService.createProduct(createProductDto, ctx.tenantId)
    }

  @Get()
  async findAllProducts(@RequestContext() ctx: RequestContextDto, @Query() filterDto: FilterProductDto) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllProducts.`);
      const { products, total } = await this.productService.findAllProducts(filterDto, ctx.tenantId)
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
  async findLatestProducts(@RequestContext() ctx: RequestContextDto, @Query('limit') limit?: number) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findLatestProducts.`);
      return await this.productService.findLatestProducts(ctx.tenantId, limit)
    }

  @Get('slug/:slug')
  async findBySlugProduct(@RequestContext() ctx: RequestContextDto, @Param('slug') slug: string) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findBySlugProduct.`);
      return await this.productService.findBySlugProduct(slug, ctx.tenantId)
    }

  @Get(':id')
  async findOneProduct(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneProduct.`);
      return await this.productService.findOneProduct(id, ctx.tenantId)
    }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateProduct(
    @RequestContext() ctx: RequestContextDto, @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateProduct.`);
      return await this.productService.updateProduct(id, updateProductDto, ctx.tenantId)
    }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async removeProduct(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeProduct.`);
      return await this.productService.removeProduct(id, ctx.tenantId)
    }

  @Get(':id/reviews')
  async getReviewsProduct(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getReviewsProduct.`);
      return await this.reviewService.findByProductReviews(id, ctx.tenantId)
    }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  async createReviewProduct(
    @RequestContext() ctx: RequestContextDto, @Param('id') productId: string,
    @Body() createReviewDto: CreateReviewDto
  ) {
      this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createReviewProduct.`);
      // Ensure the productId in the body matches the URL param
      createReviewDto.productId = productId
      return await this.reviewService.createReview(createReviewDto, ctx.tenantId)
    }
}
