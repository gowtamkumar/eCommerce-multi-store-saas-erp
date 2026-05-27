import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Body, Controller, Post, Get, Param, UseGuards, Logger } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateSteadfastOrderDto } from '@/modules/admin/operations/logistics/courier/steadfast/dto/create-order.dto'
import { SteadfastService } from '@/modules/admin/operations/logistics/courier/steadfast/steadfast.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'

@ApiTags('courier/steadfast')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('logistics')
@Controller('courier/steadfast')
export class SteadfastController {
  private readonly logger = new Logger(SteadfastController.name)

  constructor(private readonly steadfastService: SteadfastService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create a Steadfast courier order' })
  @RequirePermissions(SystemPermissions.LOGISTICS_MANAGE)
  async createSteadfastOrder(
    @RequestContext() ctx: RequestContextDto,
    @Body() createOrderDto: CreateSteadfastOrderDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createSteadfastOrder.`)
    const result = await this.steadfastService.createSteadfastOrder(createOrderDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Steadfast order created successfully',
      data: result,
    }
  }

  @Get('status/:trackingCode')
  @ApiOperation({ summary: 'Get Steadfast order tracking status' })
  @RequirePermissions(SystemPermissions.LOGISTICS_MANAGE)
  async getSteadfastStatus(
    @RequestContext() ctx: RequestContextDto,
    @Param('trackingCode') trackingCode: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getSteadfastStatus for code ${trackingCode}.`)
    const result = await this.steadfastService.getSteadfastStatus(trackingCode, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Tracking status retrieved successfully',
      data: result,
    }
  }

  @Get('label/:trackingCode')
  @ApiOperation({ summary: 'Get Steadfast print label link' })
  @RequirePermissions(SystemPermissions.LOGISTICS_MANAGE)
  async getSteadfastLabel(
    @RequestContext() ctx: RequestContextDto,
    @Param('trackingCode') trackingCode: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getSteadfastLabel for code ${trackingCode}.`)
    const result = await this.steadfastService.getSteadfastLabel(trackingCode, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Label link retrieved successfully',
      data: result,
    }
  }
}
