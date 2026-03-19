import { Body, Controller, Get, Param, Patch, Post, UseGuards, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto } from './dto/purchase-order.dto';
import { RecordSupplierPaymentDto } from './dto/record-payment.dto';
import { PurchaseOrderService } from './purchase-order.service';
import { RequestContext } from "src/common/decorators/request-context.decorator";
import { RequestContextDto } from "src/common/dto/request-context.dto";

@ApiTags('Purchase Orders')
@Controller('purchase-orders')
@UseGuards(JwtAuthGuard)
export class PurchaseOrderController {
    private readonly logger = new Logger(PurchaseOrderController.name);

    constructor(private readonly service: PurchaseOrderService) { }

    @Post()
    async createPurchaseOrder(@RequestContext() ctx: RequestContextDto, @Body() dto: CreatePurchaseOrderDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createPurchaseOrder.`);
            return await this.service.createPurchaseOrder(dto, ctx.tenantId);
        }

    @Get()
    async findAllPurchaseOrder(@RequestContext() ctx: RequestContextDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllPurchaseOrder.`);
            return await this.service.findAllPurchaseOrders(ctx.tenantId);
        }

    @Get(':id')
    async findOnePurchaseOrder(@RequestContext() ctx: RequestContextDto, @Param('id') id: string) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findOnePurchaseOrder.`);
            return await this.service.findOnePurchaseOrder(id, ctx.tenantId);
        }

    @Patch(':id/status')
    async updatePurchaseOrderStatus(
        @RequestContext() ctx: RequestContextDto, @Param('id') id: string,
        @Body() dto: UpdatePurchaseOrderStatusDto
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updatePurchaseOrderStatus.`);
            return await this.service.updatePurchaseOrderStatus(id, dto, ctx.tenantId);
        }

    @Post(':id/payments')
    async recordSupplierPayment(
        @RequestContext() ctx: RequestContextDto, @Param('id') id: string,
        @Body() dto: RecordSupplierPaymentDto
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called recordSupplierPayment.`);
            return await this.service.recordSupplierPayment(id, dto, ctx.tenantId);
        }
}
