import { Body, Controller, Get, Param, Post, Put, Query, UseGuards, Logger } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { ProductBatchService } from './product-batch.service'
import { CreateProductBatchDto } from './dto/create-product-batch.dto'
import { UpdateProductBatchDto } from './dto/update-product-batch.dto'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('inventory')
@Controller('product-batches')
export class ProductBatchController {
  private readonly logger = new Logger(ProductBatchController.name)

  constructor(private readonly service: ProductBatchService) {}

  @Post()
  @RequirePermissions(SystemPermissions.INVENTORY_WRITE)
  async create(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateProductBatchDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called create product batch.`)
    const data = await this.service.create(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Product batch created successfully',
      data,
    }
  }

  @Get()
  @RequirePermissions(SystemPermissions.INVENTORY_READ)
  async findAll(
    @RequestContext() ctx: RequestContextDto,
    @Query()
    query: PaginationDto & {
      productId?: string
      variantId?: string
      status?: string
      expiringSoon?: boolean
    },
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAll product batches.`)
    const data = await this.service.findAll(ctx, query)
    return {
      success: true,
      statusCode: 200,
      message: 'Product batches retrieved successfully',
      data,
    }
  }

  @Get(':id')
  @RequirePermissions(SystemPermissions.INVENTORY_READ)
  async findOne(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOne product batch.`)
    const data = await this.service.findOne(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Product batch details retrieved successfully',
      data,
    }
  }

  @Put(':id')
  @RequirePermissions(SystemPermissions.INVENTORY_WRITE)
  async update(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: UpdateProductBatchDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called update product batch.`)
    const data = await this.service.update(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Product batch updated successfully',
      data,
    }
  }

  @Post('sweep-expired')
  @RequirePermissions(SystemPermissions.INVENTORY_WRITE)
  async sweepExpired(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called sweepExpired product batches.`,
    )
    const affected = await this.service.markExpiredBatches(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: `Expired batches updated. Affected rows: ${affected}`,
      data: { affected },
    }
  }
}
