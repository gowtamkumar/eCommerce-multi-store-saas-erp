import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common'
import { FulfillmentService } from './fulfillment.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { PickItemsDto, UpdateFulfillmentStatusDto } from './dto/fulfillment.dto'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@Controller('operations/logistics/fulfillment')
@RequireFeature('logistics')
export class FulfillmentController {
  constructor(private readonly service: FulfillmentService) {}

  @Get()
  @RequirePermissions(SystemPermissions.FULFILLMENT_MANAGE)
  @RequirePermissions(SystemPermissions.FULFILLMENT_MANAGE)
  async findAll(
    @RequestContext() ctx: RequestContextDto,
    @Query('status') status?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.findAllTasks(ctx, status)
    return {
      success: true,
      statusCode: 200,
      message: 'Fulfillment tasks retrieved',
      data: result,
    }
  }

  @Get(':id')
  @RequirePermissions(SystemPermissions.FULFILLMENT_MANAGE)
  @RequirePermissions(SystemPermissions.FULFILLMENT_MANAGE)
  async findOne(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.getTask(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Fulfillment task retrieved',
      data: result,
    }
  }

  @Post(':id/start')
  @RequirePermissions(SystemPermissions.FULFILLMENT_MANAGE)
  @RequirePermissions(SystemPermissions.FULFILLMENT_MANAGE)
  async startPicking(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.startPicking(id, ctx.userId as string, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Picking started',
      data: result,
    }
  }

  @Post(':id/pick')
  @RequirePermissions(SystemPermissions.FULFILLMENT_MANAGE)
  @RequirePermissions(SystemPermissions.FULFILLMENT_MANAGE)
  async pickItems(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: PickItemsDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    for (const item of dto.items) {
      await this.service.pickItem(id, item.itemId, item.quantity, item.binId, ctx)
    }
    const result = await this.service.getTask(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Items picked',
      data: result,
    }
  }

  @Post(':id/pack')
  @RequirePermissions(SystemPermissions.FULFILLMENT_MANAGE)
  @RequirePermissions(SystemPermissions.FULFILLMENT_MANAGE)
  async completePacking(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.completePacking(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Packing completed',
      data: result,
    }
  }

  @Post(':id/ship')
  @RequirePermissions(SystemPermissions.FULFILLMENT_MANAGE)
  @RequirePermissions(SystemPermissions.FULFILLMENT_MANAGE)
  async shipOrder(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.shipOrder(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Order shipped and inventory updated',
      data: result,
    }
  }
}
