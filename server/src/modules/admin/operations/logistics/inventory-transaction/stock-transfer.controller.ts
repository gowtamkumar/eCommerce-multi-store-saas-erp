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
import { StockTransferService } from './stock-transfer.service'
import { CreateStockTransferDocDto } from './dto/create-stock-transfer-doc.dto'
import { UpdateStockTransferDocDto } from './dto/update-stock-transfer-doc.dto'
import { ReceiveStockTransferDto } from './dto/receive-stock-transfer.dto'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('/admin/inventory')
@Controller('stock-transfers')
export class StockTransferController {
  private readonly logger = new Logger(StockTransferController.name)

  constructor(private readonly service: StockTransferService) {}

  @Post()
  @RequirePermissions(SystemPermissions.INVENTORY_WRITE)
  async create(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateStockTransferDocDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called create stock transfer doc.`)
    const data = await this.service.create(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Stock transfer document created successfully',
      data,
    }
  }

  @Get()
  @RequirePermissions(SystemPermissions.INVENTORY_READ)
  async findAll(
    @RequestContext() ctx: RequestContextDto,
    @Query() pagination: PaginationDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAll stock transfer docs.`)
    const data = await this.service.findAll(ctx, pagination)
    return {
      success: true,
      statusCode: 200,
      message: 'Stock transfer documents retrieved successfully',
      data,
    }
  }

  @Get(':id')
  @RequirePermissions(SystemPermissions.INVENTORY_READ)
  async findOne(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOne stock transfer doc.`)
    const data = await this.service.findOne(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Stock transfer document details retrieved successfully',
      data,
    }
  }

  @Put(':id')
  @RequirePermissions(SystemPermissions.INVENTORY_WRITE)
  async update(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: UpdateStockTransferDocDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called update stock transfer doc.`)
    const data = await this.service.update(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Stock transfer document updated successfully',
      data,
    }
  }

  @Post(':id/approve')
  @RequirePermissions(SystemPermissions.INVENTORY_WRITE)
  async approve(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called approve stock transfer doc.`)
    const data = await this.service.approve(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Stock transfer document approved successfully',
      data,
    }
  }

  @Post(':id/ship')
  @RequirePermissions(SystemPermissions.INVENTORY_WRITE)
  async ship(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called ship stock transfer doc.`)
    const data = await this.service.ship(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Stock transfer document shipped successfully (stock deducted from source)',
      data,
    }
  }

  @Post(':id/receive')
  @RequirePermissions(SystemPermissions.INVENTORY_WRITE)
  async receive(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: ReceiveStockTransferDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called receive stock transfer doc.`)
    const data = await this.service.receive(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Stock transfer document received successfully (stock credited to destination)',
      data,
    }
  }

  @Post(':id/cancel')
  @RequirePermissions(SystemPermissions.INVENTORY_WRITE)
  async cancel(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called cancel stock transfer doc.`)
    const data = await this.service.cancel(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Stock transfer document cancelled successfully',
      data,
    }
  }
}
