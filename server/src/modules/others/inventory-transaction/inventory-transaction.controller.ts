import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { InventoryTransactionService } from './inventory-transaction.service';

@Controller('inventory-transactions')
export class InventoryTransactionController {
    constructor(private readonly service: InventoryTransactionService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createInventoryTransaction(
        @Body() dto: CreateInventoryTransactionDto,
        @TenantId() tenantId: string,
    ) {
        const transaction = await this.service.createInventoryTransaction(dto, tenantId);
        return { success: true, data: transaction };
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAllInventoryTransactions(@TenantId() tenantId: string) {
        const transactions = await this.service.findAllInventoryTransactions(tenantId);
        return { success: true, data: transactions };
    }

    @Get('product/:productId')
    @UseGuards(JwtAuthGuard)
    async findByProductInventoryTransactions(
        @Param('productId') productId: string,
        @TenantId() tenantId: string,
    ) {
        const transactions = await this.service.findByProductInventoryTransactions(productId, tenantId);
        return { success: true, data: transactions };
    }

    @Get('stock-summary')
    @UseGuards(JwtAuthGuard)
    async getStockSummaryInventoryTransactions(@TenantId() tenantId: string) {
        const data = await this.service.getStockSummaryInventoryTransactions(tenantId);
        return { success: true, data };
    }
}
