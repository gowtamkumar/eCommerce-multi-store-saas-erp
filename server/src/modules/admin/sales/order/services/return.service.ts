import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ReturnStatus } from '@/common/enums/return-status.enum'

import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { CreateReturnDto } from '@/modules/admin/sales/order/dto/create-return.dto'
import { FilterReturnDto } from '../dto/filter-return.dto'
import { OrderReturnRepository } from '@/modules/admin/sales/order/repositoris/order-return.repository'
import { OrderRepository } from '@/modules/admin/sales/order/repositoris/order.repository'
import { InventoryTransactionService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.service'
import { OrderReturnEntity } from '../entities/order-return.entity'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'

import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class ReturnService {
  private readonly logger = new Logger(ReturnService.name)

  constructor(
    private returnRepository: OrderReturnRepository,
    private orderRepository: OrderRepository,
    private inventoryService: InventoryTransactionService,
    private readonly cacheService: CacheService,
  ) {}

  async createReturnRequest(
    ctx: RequestContextDto,
    dto: CreateReturnDto,
  ): Promise<OrderReturnEntity> {
    this.logger.log(`${this.createReturnRequest.name} Service Called`)
    const tenantId = ctx.tenantId
    const userId = ctx.userId
    const { orderId, items, reason } = dto

    const order = await this.orderRepository.findOrderById(orderId, tenantId)

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found or does not belong to user')
    }

    for (const returnItem of items) {
      const orderItem = order.items.find(
        (oi) =>
          oi.productId === returnItem.productId &&
          (oi.variantId === returnItem.variantId || (!oi.variantId && !returnItem.variantId)),
      )

      if (!orderItem) {
        throw new BadRequestException('Item not found in order')
      }
      if (returnItem.quantity > orderItem.quantity) {
        throw new BadRequestException('Return quantity exceeds ordered quantity')
      }
    }

    const result = await this.returnRepository.createAndSaveReturn({ orderId, reason, items }, ctx)
    // Invalidate the admin list cache so the new return appears immediately
    await this.cacheService.delCache('returns:all', tenantId)
    return result
  }

  async findAllReturns(
    ctx: RequestContextDto,
    filterDto: FilterReturnDto,
  ): Promise<{ data: OrderReturnEntity[]; total: number }> {
    this.logger.log(`${this.findAllReturns.name} Service Called`)
    const tenantId = ctx.tenantId

    // Create a unique cache key based on the filter parameters
    const cacheKey = `returns:all:${JSON.stringify(filterDto)}`

    return this.cacheService.rememberCache(
      cacheKey,
      () => this.returnRepository.findPaginated(tenantId, filterDto),
      120, // 2-minute cache
      tenantId,
    )
  }

  async findByUser(ctx: RequestContextDto): Promise<OrderReturnEntity[]> {
    this.logger.log(`${this.findByUser.name} Service Called`)
    const tenantId = ctx.tenantId
    const userId = ctx.userId
    return await this.returnRepository.findByUserWithRelations(userId, tenantId)
  }

  async findOneReturn(id: string, ctx: RequestContextDto): Promise<OrderReturnEntity> {
    this.logger.log(`${this.findOneReturn.name} Service Called`)
    const tenantId = ctx.tenantId
    const returnRequest = await this.returnRepository.findByIdWithRelations(id, tenantId)

    if (!returnRequest) {
      throw new NotFoundException('Return request not found')
    }

    return returnRequest
  }

  async updateReturnRequestStatus(
    id: string,
    ctx: RequestContextDto,
    status: ReturnStatus,
    adminComment?: string,
  ): Promise<OrderReturnEntity> {
    this.logger.log(`${this.updateReturnRequestStatus.name} Service Called`)
    const tenantId = ctx.tenantId
    const returnRequest = await this.returnRepository.findByIdWithRelations(id, tenantId)

    if (!returnRequest) {
      throw new NotFoundException('Return request not found')
    }

    if (
      returnRequest.status === ReturnStatus.APPROVED ||
      returnRequest.status === ReturnStatus.REFUNDED
    ) {
      // Avoid double approval effects (restocking)
      // If moving from Approved -> Refunded, that's fine.
    }

    // Logic for APPROVAL
    if (status === ReturnStatus.APPROVED && returnRequest.status !== ReturnStatus.APPROVED) {
      await this.restockItems(returnRequest, ctx)
    }

    const updated = await this.returnRepository.updateStatus(returnRequest, status, adminComment)
    // Invalidate the admin list cache so the status change is reflected on next load
    await this.cacheService.delCache('returns:all', tenantId)
    return updated
  }

  private async restockItems(returnRequest: OrderReturnEntity, ctx: RequestContextDto) {
    this.logger.log(`${this.restockItems.name} Service Called`)
    for (const item of returnRequest.items) {
      await this.inventoryService.createInventoryTransaction(
        {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          type: InventoryTransactionType.IN,
          referenceType: InventoryTransactionReferenceType.RETURN,
          referenceId: returnRequest.id,
        },
        ctx,
      )
    }
  }
}
