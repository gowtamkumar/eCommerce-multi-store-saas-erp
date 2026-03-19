import { Body, Controller, Get, Param, Post, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateInventoryTransactionDto } from '@/modules/admin/operations/logistics/inventory-transaction/dto/create-inventory-transaction.dto';
import { InventoryTransactionService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.service';
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";

@Controller('inventory-transactions')
export class InventoryTransactionController {
    private readonly logger = new Logger(InventoryTransactionController.name);

    constructor(private readonly service: InventoryTransactionService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createInventoryTransaction(
        @RequestContext() ctx: RequestContextDto, @Body() dto: CreateInventoryTransactionDto
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createInventoryTransaction.`);
        const transaction = await this.service.createInventoryTransaction(dto, ctx.tenantId);
        return { success: true, data: transaction };
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAllInventoryTransactions(@RequestContext() ctx: RequestContextDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllInventoryTransactions.`);
        const transactions = await this.service.findAllInventoryTransactions(ctx.tenantId);
        return { success: true, data: transactions };
    }

    @Get('product/:productId')
    @UseGuards(JwtAuthGuard)
    async findByProductInventoryTransactions(
        @RequestContext() ctx: RequestContextDto, @Param('productId') productId: string
    ) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findByProductInventoryTransactions.`);
        const transactions = await this.service.findByProductInventoryTransactions(productId, ctx.tenantId);
        return { success: true, data: transactions };
    }

    @Get('stock-summary')
    @UseGuards(JwtAuthGuard)
    async getStockSummaryInventoryTransactions(@RequestContext() ctx: RequestContextDto) {
        this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getStockSummaryInventoryTransactions.`);
        const data = await this.service.getStockSummaryInventoryTransactions(ctx.tenantId);
        return { success: true, data };
    }
}
