import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { InventoryTransactionService } from './inventory-transaction.service';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';

@Controller('inventory-transactions')
export class InventoryTransactionController {
    constructor(private readonly service: InventoryTransactionService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(
        @Body() dto: CreateInventoryTransactionDto,
        @TenantId() tenantId: string,
    ) {
        const transaction = await this.service.create(dto, tenantId);
        return { success: true, data: transaction };
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(@TenantId() tenantId: string) {
        const transactions = await this.service.findAll(tenantId);
        return { success: true, data: transactions };
    }

    @Get('product/:productId')
    @UseGuards(JwtAuthGuard)
    async findByProduct(
        @Param('productId') productId: string,
        @TenantId() tenantId: string,
    ) {
        const transactions = await this.service.findByProduct(productId, tenantId);
        return { success: true, data: transactions };
    }

    @Get('stock-summary')
    @UseGuards(JwtAuthGuard)
    async getStockSummary(@TenantId() tenantId: string) {
        const data = await this.service.getStockSummary(tenantId);
        return { success: true, data };
    }
}
