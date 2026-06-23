import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { EasyPostService } from './easypost.service'

@ApiTags('courier/easypost')
@Controller('courier/easypost')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('courier')
export class EasyPostController {
  constructor(private readonly easyPostService: EasyPostService) {}

  @Post('rates')
  @RequirePermissions(SystemPermissions.ORDERS_READ)
  async getRates(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: { toAddress: any; items: any[] },
  ): Promise<BaseApiSuccessResponse<any[]>> {
    const rates = await this.easyPostService.getRates(body.toAddress, body.items, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Rates fetched successfully',
      data: rates,
    }
  }

  @Post('label/:orderId')
  @RequirePermissions(SystemPermissions.ORDERS_WRITE)
  async createLabel(
    @RequestContext() ctx: RequestContextDto,
    @Param('orderId') orderId: string,
    @Query('carrier') carrier: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.easyPostService.createShipmentAndLabel(orderId, carrier, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Shipment label generated successfully',
      data: result,
    }
  }

  @Get('invoice/:orderId')
  @RequirePermissions(SystemPermissions.ORDERS_READ)
  async getInvoice(
    @RequestContext() ctx: RequestContextDto,
    @Param('orderId') orderId: string,
  ): Promise<BaseApiSuccessResponse<string>> {
    const invoice = await this.easyPostService.generateCommercialInvoice(orderId, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Commercial invoice generated successfully',
      data: invoice,
    }
  }
}

// Helper decorator to satisfy @ApiTags if Swagger package isn't imported globally
function ApiTags(name: string) {
  return (target: any) => {}
}
