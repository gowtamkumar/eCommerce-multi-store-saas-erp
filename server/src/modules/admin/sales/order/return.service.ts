import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ReturnStatus } from '@/common/enums/return-status.enum'
import { CreateReturnDto } from '@/modules/admin/sales/order/dto/create-return.dto'
import { OrderReturnRepository } from '@/modules/admin/sales/order/order-return.repository'
import { OrderRepository } from '@/modules/admin/sales/order/order.repository'
import { ProductRepository } from '@/modules/admin/catalog/product/product.repository'
import { ProductVariantRepository } from '@/modules/admin/catalog/product/variant.repository'
import { OrderReturnEntity } from './entities/order-return.entity'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'

@Injectable()
export class ReturnService {
  private readonly logger = new Logger(ReturnService.name)

  constructor(
    private returnRepository: OrderReturnRepository,
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository,
    private variantRepository: ProductVariantRepository,
    private readonly cacheService: CacheService,
  ) {}

  async createReturnRequest(userId: string, tenantId: string, dto: CreateReturnDto): Promise<OrderReturnEntity> {
    this.logger.log(`${this.createReturnRequest.name} Service Called`)
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

    const result = await this.returnRepository.createAndSaveReturn(
      { orderId, reason, items },
      userId,
      tenantId,
    )
    // Invalidate the admin list cache so the new return appears immediately
    await this.cacheService.delCache('returns:all', tenantId)
    return result
  }

  async findAllReturns(tenantId: string): Promise<OrderReturnEntity[]> {
    this.logger.log(`${this.findAllReturns.name} Service Called`)
    // 2-minute cache: safe for admin-only list that doesn't need real-time precision
    return this.cacheService.rememberCache(
      'returns:all',
      () => this.returnRepository.findAllWithRelations(tenantId),
      120,
      tenantId,
    )
  }

  async findByUser(userId: string, tenantId: string): Promise<OrderReturnEntity[]> {
    this.logger.log(`${this.findByUser.name} Service Called`)
    return await this.returnRepository.findByUserWithRelations(userId, tenantId)
  }

  async findOneReturn(id: string, tenantId: string): Promise<OrderReturnEntity> {
    this.logger.log(`${this.findOneReturn.name} Service Called`)
    const returnRequest = await this.returnRepository.findByIdWithRelations(id, tenantId)

    if (!returnRequest) {
      throw new NotFoundException('Return request not found')
    }

    return returnRequest
  }

  async updateReturnRequestStatus(
    id: string,
    tenantId: string,
    status: ReturnStatus,
    adminComment?: string,
  ): Promise<OrderReturnEntity> {
    this.logger.log(`${this.updateReturnRequestStatus.name} Service Called`)
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
      await this.restockItems(returnRequest.items, tenantId)
    }

    const updated = await this.returnRepository.updateStatus(returnRequest, status, adminComment)
    // Invalidate the admin list cache so the status change is reflected on next load
    await this.cacheService.delCache('returns:all', tenantId)
    return updated
  }

  private async restockItems(items: any[], tenantId: string) {
    this.logger.log(`${this.restockItems.name} Service Called`)
    for (const item of items) {
      const { productId, variantId, quantity } = item

      if (variantId) {
        await this.variantRepository.incrementStock(variantId, tenantId, quantity)
      } else {
        await this.productRepository.incrementStock(productId, tenantId, quantity)
      }
    }
  }
}
