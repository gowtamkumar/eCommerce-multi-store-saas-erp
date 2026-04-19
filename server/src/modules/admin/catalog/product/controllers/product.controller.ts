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
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { CreateReviewDto } from '../../review/dto/review.dto'
import { ReviewService } from '../../review/services/review.service'
import { CreateProductDto } from '../dto/create-product.dto'
import { FilterProductDto } from '../dto/filter-product.dto'
import { ProductResponseDto } from '../dto/product-response.dto'
import { UpdateProductDto } from '../dto/update-product.dto'
import { ProductService } from '../services/product.service'

@Controller('products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name)

  constructor(
    private readonly productService: ProductService,
    private readonly reviewService: ReviewService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING)
  async create(
    @RequestContext() ctx: RequestContextDto,
    @Body() createProductDto: CreateProductDto,
  ): Promise<BaseApiSuccessResponse<ProductResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called create.`)
    const result = await this.productService.createProduct(createProductDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: `New product created`,
      data: result,
    }
  }

  @Get()
  async findAllProducts(
    @RequestContext() ctx: RequestContextDto,
    @Query() filterDto: FilterProductDto,
  ): Promise<BaseApiSuccessResponse<ProductResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllProducts.`)
    const { products, total } = await this.productService.findAllProducts(ctx, filterDto)
    return {
      success: true,
      statusCode: 200,
      message: `List of products`,
      data: products,
      pagination: {
        total,
        page: filterDto.page,
        limit: filterDto.limit,
        totalPages: Math.ceil(total / filterDto.limit),
      },
    }
  }

  @Get('filters')
  async getFilterOptions(
    @RequestContext() ctx: RequestContextDto,
    @Query('categoryId') categoryId?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getFilterOptions.`)
    const filters = await this.productService.getFilterOptions(ctx, categoryId)
    return {
      success: true,
      statusCode: 200,
      message: `Filter options retrieved`,
      data: filters,
    }
  }

  @Get('latest')
  async findLatestProducts(
    @RequestContext() ctx: RequestContextDto,
    @Query('limit') limit?: number,
  ): Promise<BaseApiSuccessResponse<ProductResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findLatestProducts.`)
    const result = await this.productService.findLatestProducts(ctx, limit)
    return {
      success: true,
      statusCode: 200,
      message: `Latest products retrieved`,
      data: result,
    }
  }

  @Get('slug/:slug')
  async findBySlugProduct(
    @RequestContext() ctx: RequestContextDto,
    @Param('slug') slug: string,
  ): Promise<BaseApiSuccessResponse<ProductResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findBySlugProduct.`)
    const result = await this.productService.findBySlugProduct(slug, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `Product details for slug: ${slug}`,
      data: result,
    }
  }

  @Get(':id')
  async findOneProduct(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<ProductResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOneProduct.`)
    const result = await this.productService.findOneProduct(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `Product details`,
      data: result,
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.MARKETING)
  async updateProduct(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<BaseApiSuccessResponse<ProductResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateProduct.`)
    const result = await this.productService.updateProduct(id, updateProductDto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `Product of ID ${id} updated`,
      data: result,
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async removeProduct(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeProduct.`)
    const result = await this.productService.removeProduct(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: result.message || `Product deleted successfully`,
      data: null,
    }
  }

  @Get(':id/reviews')
  async getReviewsProduct(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getReviewsProduct.`)
    const result = await this.reviewService.findByProductReviews(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `List of reviews for product ID ${id}`,
      data: result,
    }
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  async createReviewProduct(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') productId: string,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createReviewProduct.`)
    // Ensure the productId in the body matches the URL param
    createReviewDto.productId = productId
    const result = await this.reviewService.createReview(createReviewDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: `Review created successfully`,
      data: result,
    }
  }
}
