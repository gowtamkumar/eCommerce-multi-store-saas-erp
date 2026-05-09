import { Body, Controller, Post, UseGuards, Logger } from '@nestjs/common'
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
@RequireFeature('/admin/couriers')
@Controller('courier/steadfast')
export class SteadfastController {
  private readonly logger = new Logger(SteadfastController.name)

  constructor(private readonly steadfastService: SteadfastService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create a Steadfast courier order' })
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
}
