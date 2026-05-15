import { Body, Controller, Get, Param, Post, UseGuards, Logger, Query } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { CreateInventoryTransactionDto } from '@/modules/admin/operations/logistics/inventory-transaction/dto/create-inventory-transaction.dto'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { InventoryLedgerResponseDto } from './dto/inventory-transaction-response.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('/admin/inventory')
@Controller('inventory-ledger')
export class InventoryLedgerController {
  private readonly logger = new Logger(InventoryLedgerController.name)

  constructor(private readonly service: InventoryLedgerService) {}

  @Post()
  async createLedgerEntry(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateInventoryTransactionDto,
  ): Promise<BaseApiSuccessResponse<InventoryLedgerResponseDto>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called createLedgerEntry.`,
    )
    const transaction = await this.service.createLedgerEntry(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Inventory ledger entry created successfully',
      data: transaction as any,
    }
  }

  @Get()
  async findAllLedgerEntries(
    @RequestContext() ctx: RequestContextDto,
    @Query() pagination: PaginationDto,
    @Query('type') type?: InventoryTransactionType,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called findAllLedgerEntries.`,
    )
    const result = await this.service.findAllLedgerEntries(ctx, pagination, type)
    return {
      success: true,
      statusCode: 200,
      message: 'List of inventory ledger entries retrieved',
      data: result,
    }
  }

  @Get('product/:productId')
  async findByProductLedgerEntries(
    @RequestContext() ctx: RequestContextDto,
    @Param('productId') productId: string,
  ): Promise<BaseApiSuccessResponse<InventoryLedgerResponseDto[]>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called findByProductLedgerEntries.`,
    )
    const transactions = await this.service.findByProductLedgerEntries(productId, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Product inventory ledger entries retrieved',
      data: transactions as any,
    }
  }

  @Get('stock-summary')
  async getStockSummary(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called getStockSummary.`,
    )
    const data = await this.service.getStockSummary(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Stock summary retrieved',
      data: data as any,
    }
  }
}
