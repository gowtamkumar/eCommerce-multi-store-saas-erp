import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { Body, Controller, Get, Logger, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PurchaseOrderResponseDto } from '../dto/purchase-order-response.dto'
import { CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto } from '../dto/purchase-order.dto'
import { RecordSupplierPaymentDto } from '../dto/record-payment.dto'
import { PurchaseOrderPaymentStatus } from '../enums/purchase-order-payment-status.enum'
import { PurchaseOrderService } from '../services/purchase-order.service'

@ApiTags('Purchase Orders')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('purchasing')
@Controller('purchase-orders')
export class PurchaseOrderController {
  private readonly logger = new Logger(PurchaseOrderController.name)

  constructor(private readonly service: PurchaseOrderService) {}

  @Post()
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  async createPurchaseOrder(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreatePurchaseOrderDto,
  ): Promise<BaseApiSuccessResponse<PurchaseOrderResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createPurchaseOrder.`)
    const result = await this.service.createPurchaseOrder(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Purchase Order created successfully',
      data: result as any,
    }
  }

  @Get()
  @RequirePermissions(SystemPermissions.PURCHASING_READ)
  @RequirePermissions(SystemPermissions.PURCHASING_READ)
  async findAllPurchaseOrder(
    @RequestContext() ctx: RequestContextDto,
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: PurchaseOrderStatus,
    @Query('paymentStatus') paymentStatus?: PurchaseOrderPaymentStatus,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllPurchaseOrder.`)
    const result = await this.service.findAllPurchaseOrders(
      ctx,
      paginationDto,
      status,
      paymentStatus,
    )
    return {
      success: true,
      statusCode: 200,
      message: 'List of purchase orders retrieved',
      data: result,
    }
  }

  @Get(':id')
  @RequirePermissions(SystemPermissions.PURCHASING_READ)
  @RequirePermissions(SystemPermissions.PURCHASING_READ)
  async findOnePurchaseOrder(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<PurchaseOrderResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOnePurchaseOrder.`)
    const result = await this.service.findOnePurchaseOrder(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Purchase order retrieved',
      data: result as any,
    }
  }

  @Patch(':id/status')
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  async updatePurchaseOrderStatus(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: UpdatePurchaseOrderStatusDto,
  ): Promise<BaseApiSuccessResponse<PurchaseOrderResponseDto>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called updatePurchaseOrderStatus.`,
    )
    const result = await this.service.updatePurchaseOrderStatus(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Purchase order status updated successfully',
      data: result as any,
    }
  }

  @Post(':id/payments')
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  async recordSupplierPayment(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: RecordSupplierPaymentDto,
  ): Promise<BaseApiSuccessResponse<PurchaseOrderResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called recordSupplierPayment.`)
    const result = await this.service.recordSupplierPayment(id, dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Payment recorded successfully',
      data: result as any,
    }
  }
}
