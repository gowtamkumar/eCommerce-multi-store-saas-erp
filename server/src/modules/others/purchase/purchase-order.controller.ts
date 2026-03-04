import { Body, Controller, Get, Param, Post, Patch, UseGuards } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto } from './dto/purchase-order.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard)
export class PurchaseOrderController {
    constructor(private readonly service: PurchaseOrderService) { }

    @Post()
    async create(@Body() dto: CreatePurchaseOrderDto, @TenantId() tenantId: string) {
        return await this.service.create(dto, tenantId);
    }

    @Get()
    async findAll(@TenantId() tenantId: string) {
        return await this.service.findAll(tenantId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
        return await this.service.findOne(id, tenantId);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdatePurchaseOrderStatusDto,
        @TenantId() tenantId: string,
    ) {
        return await this.service.updateStatus(id, dto, tenantId);
    }
}
