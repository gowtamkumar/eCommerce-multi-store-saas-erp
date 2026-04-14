import { Body, Controller, Get, Param, Patch, Post, UseGuards, Logger } from '@nestjs/common'
import { ReturnStatus } from '@/common/enums/return-status.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CreateReturnDto } from '@/modules/admin/sales/order/dto/create-return.dto'
import { ReturnService } from '@/modules/admin/sales/order/services/return.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { OrderReturnResponseDto } from '../dto/order-return-response.dto'

@Controller('returns')
@UseGuards(JwtAuthGuard)
export class ReturnController {
  private readonly logger = new Logger(ReturnController.name)

  constructor(private readonly returnService: ReturnService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR, UserRole.USER)
  async createReturnRequest(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateReturnDto,
  ): Promise<BaseApiSuccessResponse<OrderReturnResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createReturnRequest.`)
    const result = await this.returnService.createReturnRequest(ctx.userId, ctx.tenantId, dto)
    return {
      success: true,
      statusCode: 201,
      message: 'Return request created successfully',
      data: result as any,
    }
  }

  @Get('my-returns')
  @Roles(
    UserRole.ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.SUPPORT,
    UserRole.MARKETING,
    UserRole.OPERATOR,
    UserRole.USER,
  )
  async findMyReturns(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<OrderReturnResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findMyReturns.`)
    const result = await this.returnService.findByUser(ctx.userId, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Your return requests retrieved',
      data: result as any,
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR)
  async findAllReturns(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<OrderReturnResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllReturns.`)
    const result = await this.returnService.findAllReturns(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'All return requests retrieved',
      data: result as any,
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR)
  async findReturnById(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<OrderReturnResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findReturnById.`)
    const result = await this.returnService.findOneReturn(id, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Return request retrieved',
      data: result as any,
    }
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT)
  async updateStatus(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body('status') status: ReturnStatus,
    @Body('comment') comment?: string,
  ): Promise<BaseApiSuccessResponse<OrderReturnResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateStatus.`)
    const result = await this.returnService.updateReturnRequestStatus(
      id,
      ctx.tenantId,
      status,
      comment,
    )
    return {
      success: true,
      statusCode: 200,
      message: 'Return request status updated',
      data: result as any,
    }
  }
}
