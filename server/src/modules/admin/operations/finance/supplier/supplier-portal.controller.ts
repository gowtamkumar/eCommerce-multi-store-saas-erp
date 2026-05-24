import { Controller, Get, Patch, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { SupplierService } from './supplier.service'
import { PurchaseOrderService } from '../purchase/services/purchase-order.service'
import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@Controller('supplier-portal')
export class SupplierPortalController {
  constructor(
    private readonly supplierService: SupplierService,
    private readonly poService: PurchaseOrderService,
  ) {}

  private async getLinkedSupplier(ctx: RequestContextDto) {
    const supplier = await (this.supplierService as any).repository.findByUserIdAndTenant(ctx.userId, ctx.tenantId)
    if (!supplier) {
      throw new ForbiddenException('Logged-in user is not associated with a registered supplier profile')
    }
    return supplier
  }

  @Get('me')
  async getMyProfile(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const supplier = await this.getLinkedSupplier(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Supplier profile retrieved successfully',
      data: supplier,
    }
  }

  @Get('purchase-orders')
  async getMyPurchaseOrders(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const supplier = await this.getLinkedSupplier(ctx)
    const pos = await this.poService.findAllBySupplier(supplier.id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Purchase orders retrieved successfully',
      data: pos,
    }
  }

  @Get('purchase-orders/:id')
  async getMyPurchaseOrderDetails(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const supplier = await this.getLinkedSupplier(ctx)
    const po = await this.poService.findOnePurchaseOrder(id, ctx)
    if (po.supplierId !== supplier.id) {
      throw new ForbiddenException('Access denied to this purchase order')
    }
    return {
      success: true,
      statusCode: 200,
      message: 'Purchase order details retrieved successfully',
      data: po,
    }
  }

  @Patch('purchase-orders/:id/status')
  async updateMyPurchaseOrderStatus(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body('status') status: PurchaseOrderStatus,
    @Body('warehouseId') warehouseId?: string,
    @Body('branchId') branchId?: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const supplier = await this.getLinkedSupplier(ctx)
    const po = await this.poService.findOnePurchaseOrder(id, ctx)
    if (po.supplierId !== supplier.id) {
      throw new ForbiddenException('Access denied to this purchase order')
    }

    const updated = await this.poService.updatePurchaseOrderStatus(id, { status, warehouseId, branchId }, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Purchase order status updated successfully',
      data: updated,
    }
  }
}
