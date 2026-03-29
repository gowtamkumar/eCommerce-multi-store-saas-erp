import { Body, Controller, Get, Param, Post, UseGuards, Logger } from '@nestjs/common'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { RolesGuard } from '@/common/guards/roles.guard'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { CreateInventoryTransactionDto } from '@/modules/admin/operations/logistics/inventory-transaction/dto/create-inventory-transaction.dto'
import { InventoryTransactionService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { InventoryTransactionResponseDto } from './dto/inventory-transaction-response.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory-transactions')
export class InventoryTransactionController {
  private readonly logger = new Logger(InventoryTransactionController.name)

  constructor(private readonly service: InventoryTransactionService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.OPERATOR)
  async createInventoryTransaction(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateInventoryTransactionDto,
  ): Promise<BaseApiSuccessResponse<InventoryTransactionResponseDto>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called createInventoryTransaction.`,
    )
    const transaction = await this.service.createInventoryTransaction(dto, ctx.tenantId)
    return {
      success: true,
      statusCode: 201,
      message: 'Inventory transaction created successfully',
      data: transaction as any,
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR)
  async findAllInventoryTransactions(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<InventoryTransactionResponseDto[]>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called findAllInventoryTransactions.`,
    )
    const transactions = await this.service.findAllInventoryTransactions(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'List of inventory transactions retrieved',
      data: transactions as any,
    }
  }

  @Get('product/:productId')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR)
  async findByProductInventoryTransactions(
    @RequestContext() ctx: RequestContextDto,
    @Param('productId') productId: string,
  ): Promise<BaseApiSuccessResponse<InventoryTransactionResponseDto[]>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called findByProductInventoryTransactions.`,
    )
    const transactions = await this.service.findByProductInventoryTransactions(
      productId,
      ctx.tenantId,
    )
    return {
      success: true,
      statusCode: 200,
      message: 'Product inventory transactions retrieved',
      data: transactions as any,
    }
  }

  @Get('stock-summary')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR)
  async getStockSummaryInventoryTransactions(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any[]>> {
    this.logger.verbose(
      `User "${ctx.user?.username || 'System'}" called getStockSummaryInventoryTransactions.`,
    )
    const data = await this.service.getStockSummaryInventoryTransactions(ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Stock summary retrieved',
      data: data as any,
    }
  }
}
