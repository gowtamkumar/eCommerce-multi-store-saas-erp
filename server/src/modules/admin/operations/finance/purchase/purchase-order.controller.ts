import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Body, Controller, Get, Logger, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PurchaseOrderResponseDto } from './dto/purchase-order-response.dto'
import { CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto } from './dto/purchase-order.dto'
import { RecordSupplierPaymentDto } from './dto/record-payment.dto'
import { PurchaseOrderService } from './purchase-order.service'

@ApiTags('Purchase Orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('purchase-orders')
export class PurchaseOrderController {
  private readonly logger = new Logger(PurchaseOrderController.name)

  constructor(private readonly service: PurchaseOrderService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async createPurchaseOrder(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreatePurchaseOrderDto,
  ): Promise<BaseApiSuccessResponse<PurchaseOrderResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createPurchaseOrder.`)
    const result = await this.service.createPurchaseOrder(dto, ctx.tenantId)
    return {
      success: true,
      statusCode: 201,
      message: 'Purchase Order created successfully',
      data: result,
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR)
  async findAllPurchaseOrder(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<PurchaseOrderResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllPurchaseOrder.`)
    const result = await this.service.findAllPurchaseOrders(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'List of purchase orders retrieved',
      data: result,
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR)
  async findOnePurchaseOrder(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<PurchaseOrderResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOnePurchaseOrder.`)
    const result = await this.service.findOnePurchaseOrder(id, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Purchase order retrieved',
      data: result,
    }
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async updatePurchaseOrderStatus(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseOrderStatusDto,
  ): Promise<BaseApiSuccessResponse<PurchaseOrderResponseDto>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called updatePurchaseOrderStatus.`,
    )
    const result = await this.service.updatePurchaseOrderStatus(id, dto, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Purchase order status updated successfully',
      data: result,
    }
  }

  @Post(':id/payments')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER)
  async recordSupplierPayment(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: RecordSupplierPaymentDto,
  ): Promise<BaseApiSuccessResponse<PurchaseOrderResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called recordSupplierPayment.`)
    const result = await this.service.recordSupplierPayment(id, dto, ctx.tenantId)
    return {
      success: true,
      statusCode: 201,
      message: 'Payment recorded successfully',
      data: result,
    }
  }
}
