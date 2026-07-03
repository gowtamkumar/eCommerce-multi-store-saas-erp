import { CustomerRoute } from '@/common/decorators/customer-route.decorator'
import { SkipPermissionCheck } from '@/common/decorators/skip-permission-check.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { CreateReturnDto } from '@/modules/admin/sales/order/dto/create-return.dto'
import { OrderReturnResponseDto } from '@/modules/admin/sales/order/dto/order-return-response.dto'
import { ReturnService } from '@/modules/admin/sales/order/services/return.service'
import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common'

@CustomerRoute()
@SkipPermissionCheck()
@UseGuards(JwtAuthGuard)
@Controller('store/returns')
export class StoreReturnController {
  private readonly logger = new Logger(StoreReturnController.name)

  constructor(private readonly returnService: ReturnService) {}

  @Post()
  async createReturnRequest(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateReturnDto,
  ): Promise<BaseApiSuccessResponse<OrderReturnResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createReturnRequest.`)
    const result = await this.returnService.createReturnRequest(ctx, dto)
    return {
      success: true,
      statusCode: 201,
      message: 'Return request created successfully',
      data: result as any,
    }
  }

  @Get('my-returns')
  async findMyReturns(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<OrderReturnResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findMyReturns.`)
    const result = await this.returnService.findByUser(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Your return requests retrieved',
      data: result as any,
    }
  }
}
