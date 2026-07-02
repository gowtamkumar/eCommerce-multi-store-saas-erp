import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Audit } from '@/common/decorators/audit.decorator'
import { Public } from '@/common/decorators/public.decorator'
import { assertStoreContext } from '@/common/utils/assert-store-context.util'
import { CustomThrottlerGuard } from '@/common/throttler/throttler.guard'
import { SkipNonStorefrontAiThrottles } from '@/common/throttler/throttler-skip.decorator'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { CreateReviewDto } from '../../review/dto/review.dto'
import { ReviewService } from '../../review/services/review.service'
import { CreateProductDto } from '../dto/create-product.dto'
import { FilterProductDto } from '../dto/filter-product.dto'
import { ImportProductsDto, ImportProductsResultDto } from '../dto/import-products.dto'
import { ProductResponseDto } from '../dto/product-response.dto'
import { UpdateProductDto } from '../dto/update-product.dto'
import { ProductService } from '../services/product.service'
import { ProductQaService } from '../services/product-qa.service'
import { StorefrontAssistantService } from '../services/storefront-assistant.service'
import {
  AskProductQuestionDto,
  ProductQaResultDto,
  StorefrontAiStatusDto,
  StorefrontAssistantChatDto,
  StorefrontAssistantChatResultDto,
} from '../dto/ask-product-question.dto'

@UseGuards(SubscriptionGuard)
@RequireFeature('catalog')
@Controller('products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name)

  constructor(
    private readonly productService: ProductService,
    private readonly reviewService: ReviewService,
    private readonly productQaService: ProductQaService,
    private readonly storefrontAssistantService: StorefrontAssistantService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.CATALOG_WRITE)
  @Audit({ entity: 'Product', action: 'CREATE' })
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

  @Post('import')
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.CATALOG_IMPORT, SystemPermissions.CATALOG_WRITE)
  @Audit({ entity: 'Product', action: 'IMPORT' })
  @HttpCode(200)
  async importProducts(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: ImportProductsDto,
  ): Promise<BaseApiSuccessResponse<ImportProductsResultDto>> {
    const data = await this.productService.importProductsFromRows(dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: `Imported ${data.createdCount} product(s)`,
      data,
    }
  }

  @Get()
  @Public()
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

  @Get('storefront-ai/status')
  @Public()
  async getStorefrontAiStatus(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<StorefrontAiStatusDto>> {
    const storeId = assertStoreContext(ctx.storeId)
    const data = await this.storefrontAssistantService.getStatus(storeId)
    return {
      success: true,
      statusCode: 200,
      message: 'Storefront AI status retrieved',
      data,
    }
  }

  @Post('storefront-ai/chat')
  @Public()
  @UseGuards(CustomThrottlerGuard)
  @SkipNonStorefrontAiThrottles()
  @Throttle({ 'ai-storefront': { limit: 20, ttl: 60000 } })
  @HttpCode(200)
  async chatWithShoppingAssistant(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: StorefrontAssistantChatDto,
  ): Promise<BaseApiSuccessResponse<StorefrontAssistantChatResultDto>> {
    const storeId = assertStoreContext(ctx.storeId)
    const data = await this.storefrontAssistantService.chat(storeId, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Shopping assistant reply generated',
      data,
    }
  }

  @Get('embeddings/status')
  @UseGuards(JwtAuthGuard)
  @RequireFeature('ai')
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.CATALOG_READ)
  async getEmbeddingIndexStatus(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.productService.getEmbeddingIndexStatus(ctx.storeId)
    return {
      success: true,
      statusCode: 200,
      message: 'Product embedding index status retrieved',
      data,
    }
  }

  @Post('embeddings/reindex')
  @UseGuards(JwtAuthGuard)
  @RequireFeature('ai')
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.CATALOG_WRITE)
  @Audit({ entity: 'ProductEmbedding', action: 'REINDEX' })
  async reindexProductEmbeddings(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.productService.reindexProductEmbeddings(ctx.storeId)
    return {
      success: true,
      statusCode: 200,
      message: 'Product catalog embeddings reindexed',
      data,
    }
  }

  @Post('embeddings/reindex/async')
  @UseGuards(JwtAuthGuard)
  @RequireFeature('ai')
  @RequirePermissions(SystemPermissions.AI_USE, SystemPermissions.CATALOG_WRITE)
  @Audit({ entity: 'ProductEmbedding', action: 'REINDEX_ASYNC' })
  @HttpCode(202)
  async reindexProductEmbeddingsAsync(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const job = await this.productService.enqueueProductEmbeddingsReindex(ctx.storeId)
    return {
      success: true,
      statusCode: 202,
      message: 'Product catalog embedding reindex queued',
      data: {
        id: job.id,
        status: job.status,
        type: job.type,
      },
    }
  }

  @Get('filters')
  @Public()
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
  @Public()
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

  @Post('slug/:slug/ask')
  @Public()
  @HttpCode(200)
  async askAboutProduct(
    @RequestContext() ctx: RequestContextDto,
    @Param('slug') slug: string,
    @Body() dto: AskProductQuestionDto,
  ): Promise<BaseApiSuccessResponse<ProductQaResultDto>> {
    const storeId = assertStoreContext(ctx.storeId)
    const data = await this.productQaService.askAboutProduct(storeId, slug, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Product answer generated',
      data,
    }
  }

  @Get('slug/:slug')
  @Public()
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
  @Public()
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
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.CATALOG_WRITE)
  @Audit({ entity: 'Product', action: 'UPDATE' })
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
  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.CATALOG_WRITE)
  @Audit({ entity: 'Product', action: 'DELETE' })
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
  @Public()
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
  @RequirePermissions(SystemPermissions.CATALOG_WRITE)
  @Audit({ entity: 'ProductReview', action: 'CREATE' })
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
