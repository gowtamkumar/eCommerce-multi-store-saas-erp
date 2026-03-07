import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto } from './dto/purchase-order.dto';
import { RecordSupplierPaymentDto } from './dto/record-payment.dto';
import { PurchaseOrderService } from './purchase-order.service';

@ApiTags('Purchase Orders')
@Controller('purchase-orders')
@UseGuards(JwtAuthGuard)
export class PurchaseOrderController {
    constructor(private readonly service: PurchaseOrderService) { }

    @Post()
    async createPurchaseOrder(@Body() dto: CreatePurchaseOrderDto, @TenantId() tenantId: string) {
        return await this.service.createPurchaseOrder(dto, tenantId);
    }

    @Get()
    async findAllPurchaseOrder(@TenantId() tenantId: string) {
        return await this.service.findAllPurchaseOrders(tenantId);
    }

    @Get(':id')
    async findOnePurchaseOrder(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.service.findOnePurchaseOrder(id, tenantId);
    }

    @Patch(':id/status')
    async updatePurchaseOrderStatus(
        @Param('id') id: string,
        @Body() dto: UpdatePurchaseOrderStatusDto,
        @TenantId() tenantId: string,
    ) {
        return await this.service.updatePurchaseOrderStatus(id, dto, tenantId);
    }

    @Post(':id/payments')
    async recordSupplierPayment(
        @Param('id') id: string,
        @Body() dto: RecordSupplierPaymentDto,
        @TenantId() tenantId: string,
    ) {
        return await this.service.recordSupplierPayment(id, dto, tenantId);
    }
}
