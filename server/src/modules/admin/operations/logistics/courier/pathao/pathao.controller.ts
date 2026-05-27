import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Body, Controller, Post, Get, Param, Query, UseGuards, Logger } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreatePathaoOrderDto } from '@/modules/admin/operations/logistics/courier/pathao/dto/create-order.dto'
import { PathaoService } from '@/modules/admin/operations/logistics/courier/pathao/pathao.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'

@ApiTags('courier/pathao')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('logistics')
@Controller('courier/pathao')
export class PathaoController {
  private readonly logger = new Logger(PathaoController.name)

  constructor(private readonly pathaoService: PathaoService) {}

  @Post('create-order')
  @RequirePermissions(SystemPermissions.LOGISTICS_MANAGE)
  @ApiOperation({ summary: 'Create a Pathao courier order' })
  async createPathaoOrder(
    @RequestContext() ctx: RequestContextDto,
    @Body() createOrderDto: CreatePathaoOrderDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createPathaoOrder.`)
    const result = await this.pathaoService.createPathaoOrder(createOrderDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Pathao order created successfully',
      data: result,
    }
  }

  @Post('price-calculation')
  @RequirePermissions(SystemPermissions.LOGISTICS_MANAGE)
  @ApiOperation({ summary: 'Calculate Pathao shipping cost rates' })
  async calculatePathaoPrice(
    @RequestContext() ctx: RequestContextDto,
    @Body() data: any,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called calculatePathaoPrice.`)
    const result = await this.pathaoService.calculatePathaoPrice(data, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Pathao price calculated successfully',
      data: result,
    }
  }

  @Get('status/:trackingCode')
  @RequirePermissions(SystemPermissions.LOGISTICS_MANAGE)
  @ApiOperation({ summary: 'Get Pathao order tracking status' })
  async getPathaoStatus(
    @RequestContext() ctx: RequestContextDto,
    @Param('trackingCode') trackingCode: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getPathaoStatus for code ${trackingCode}.`)
    const result = await this.pathaoService.getPathaoStatus(trackingCode, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Tracking status retrieved successfully',
      data: result,
    }
  }

  @Get('cities')
  @RequirePermissions(SystemPermissions.LOGISTICS_MANAGE)
  @ApiOperation({ summary: 'Get Pathao cities list' })
  async getCities(@RequestContext() ctx: RequestContextDto): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.pathaoService.getCities(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Cities retrieved successfully',
      data: result,
    }
  }

  @Get('city/:cityId/zones')
  @RequirePermissions(SystemPermissions.LOGISTICS_MANAGE)
  @ApiOperation({ summary: 'Get Pathao zones list' })
  async getZones(
    @Param('cityId') cityId: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.pathaoService.getZones(Number(cityId), ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Zones retrieved successfully',
      data: result,
    }
  }

  @Get('zone/:zoneId/areas')
  @RequirePermissions(SystemPermissions.LOGISTICS_MANAGE)
  @ApiOperation({ summary: 'Get Pathao areas list' })
  async getAreas(
    @Param('zoneId') zoneId: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.pathaoService.getAreas(Number(zoneId), ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Areas retrieved successfully',
      data: result,
    }
  }
}
