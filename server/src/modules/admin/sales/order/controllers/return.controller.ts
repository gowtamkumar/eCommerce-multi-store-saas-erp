import { FilterReturnDto } from '@/modules/admin/sales/order/dto/filter-return.dto'
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, Logger } from '@nestjs/common'
import { ReturnStatus } from '@/common/enums/return-status.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { CreateReturnDto } from '@/modules/admin/sales/order/dto/create-return.dto'
import { ReturnService } from '@/modules/admin/sales/order/services/return.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { OrderReturnResponseDto } from '../dto/order-return-response.dto'

@Controller('returns')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('/admin/returns')
export class ReturnController {
  private readonly logger = new Logger(ReturnController.name)

  constructor(private readonly returnService: ReturnService) {}

  @Post()
  @RequirePermissions(SystemPermissions.RETURNS_WRITE)
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
  @RequirePermissions(SystemPermissions.RETURNS_READ)
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

  @Get()
  @RequirePermissions(SystemPermissions.RETURNS_READ)
  async findAllReturns(
    @RequestContext() ctx: RequestContextDto,
    @Query() filterDto: FilterReturnDto,
  ): Promise<BaseApiSuccessResponse<{ data: OrderReturnResponseDto[]; pagination: any }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllReturns.`)
    const { data, total } = await this.returnService.findAllReturns(ctx, filterDto)
    return {
      success: true,
      statusCode: 200,
      message: 'Return requests retrieved successfully',
      data: {
        data: data as any,
        pagination: {
          total,
          page: filterDto.page,
          limit: filterDto.limit,
          totalPages: Math.ceil(total / filterDto.limit),
        },
      },
    }
  }

  @Get(':id')
  @RequirePermissions(SystemPermissions.RETURNS_READ)
  async findReturnById(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<OrderReturnResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findReturnById.`)
    const result = await this.returnService.findOneReturn(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Return request retrieved',
      data: result as any,
    }
  }

  @Patch(':id/status')
  @RequirePermissions(SystemPermissions.RETURNS_WRITE)
  async updateStatus(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body('status') status: ReturnStatus,
    @Body('comment') comment?: string,
  ): Promise<BaseApiSuccessResponse<OrderReturnResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateStatus.`)
    const result = await this.returnService.updateReturnRequestStatus(id, ctx, status, comment)
    return {
      success: true,
      statusCode: 200,
      message: 'Return request status updated',
      data: result as any,
    }
  }
}
