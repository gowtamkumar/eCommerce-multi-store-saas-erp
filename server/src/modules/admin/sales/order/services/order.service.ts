import { RequestContextDto } from '@/common/dto/request-context.dto'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { CreateOrderDto } from '@/modules/admin/sales/order/dto/create-order.dto'
import { FilterOrderDto } from '@/modules/admin/sales/order/dto/filter-order.dto'
import { UpdateOrderDto } from '@/modules/admin/sales/order/dto/update-order.dto'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { OrderRepository } from '../repositories/order.repository'
import { OrderCheckoutService } from './order-checkout.service'
import { OrderLifecycleService } from './order-lifecycle.service'

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name)

  constructor(
    private orderRepository: OrderRepository,
    private readonly cacheService: CacheService,
    private readonly orderCheckoutService: OrderCheckoutService,
    private readonly orderLifecycleService: OrderLifecycleService,
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    ctx: RequestContextDto,
  ): Promise<{ message: string; success: boolean; order: OrderEntity }> {
    return await this.orderCheckoutService.createOrder(createOrderDto, ctx)
  }

  async findAllOrders(
    filterDto: FilterOrderDto,
    ctx: RequestContextDto,
  ): Promise<{ orders: OrderEntity[]; total: number }> {
    this.logger.log(`${this.findAllOrders.name} Service Called`)
    const tenantId = ctx.tenantId
    const page = filterDto.page ? Number(filterDto.page) : 1
    const limit = filterDto.limit ? Number(filterDto.limit) : 20
    return await this.orderRepository.findAllOrders(
      {
        ...filterDto,
        page,
        limit,
      },
      tenantId,
    )
  }

  async findOneOrder(id: string, ctx: RequestContextDto): Promise<OrderEntity> {
    this.logger.log(`${this.findOneOrder.name} Service Called`)
    const tenantId = ctx.tenantId
    const order = await this.orderRepository.findOrderById(id, tenantId)

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    return order
  }

  async findOneForCourier(id: string, ctx: RequestContextDto): Promise<OrderEntity> {
    this.logger.log(`${this.findOneForCourier.name} Service Called`)
    const tenantId = ctx.tenantId
    const order = await this.orderRepository.findOneForCourier(id, tenantId)

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    return order
  }

  async findOrderByTrackingId(
    trackingId: string,
    tenantId?: string,
  ): Promise<OrderEntity | null> {
    return await this.orderRepository.findOrderByTrackingId(trackingId, tenantId)
  }

  async findOrderByInvoiceCode(
    invoiceCode: string,
    tenantId?: string,
  ): Promise<OrderEntity | null> {
    return await this.orderRepository.findOrderByInvoiceCode(invoiceCode, tenantId)
  }

  async findByUserId(
    userId: string,
    ctx: RequestContextDto,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ orders: OrderEntity[]; total: number }> {
    this.logger.log(`${this.findByUserId.name} Service Called`)
    const tenantId = ctx.tenantId
    return await this.orderRepository.findByUserIdPaginated(userId, tenantId, page, limit, search)
  }

  async countByUserId(userId: string, ctx: RequestContextDto): Promise<number> {
    this.logger.log(`${this.countByUserId.name} Service Called`)
    const tenantId = ctx.tenantId
    return await this.orderRepository.countByUserId(userId, tenantId)
  }

  async updateOrder(
    id: string,
    updateOrderDto: UpdateOrderDto,
    ctx: RequestContextDto,
  ): Promise<OrderEntity> {
    return await this.orderLifecycleService.updateOrder(id, updateOrderDto, ctx)
  }

  async countByTenant(ctx: RequestContextDto): Promise<number> {
    this.logger.log(`${this.countByTenant.name} Service Called`)
    const tenantId = ctx.tenantId
    return await this.orderRepository.countByTenant(tenantId)
  }

  async orderOverview(ctx?: RequestContextDto): Promise<{
    totalOrders: number
    pendingOrders: number
    completedOrders: number
    cancelledOrders: number
  }> {
    const tenantId = ctx?.tenantId
    const cacheKey = 'orders:overview'
    return this.cacheService.rememberCache(
      cacheKey,
      () => this.orderRepository.orderOverview(tenantId),
      300,
      tenantId,
    )
  }
}
