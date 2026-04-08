import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, Repository } from 'typeorm'
import { OrderEntity } from './entities/order.entity'
import { OrderStatus } from '@/common/enums/order-status.enum'

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repo: Repository<OrderEntity>,
  ) { }

  async findOrderById(id: string, tenantId: string): Promise<OrderEntity | null> {
    return await this.repo.findOne({
      where: { id, tenantId },
      relations: ['items', 'items.product', 'items.variant', 'returns', 'shippingAddress'],
    })
  }

  async findOrderByTransactionId(transactionId: string): Promise<OrderEntity | null> {
    return await this.repo.findOne({
      where: { transactionId },
    })
  }

  async findOneForCourier(id: string, tenantId: string): Promise<OrderEntity | null> {
    return await this.repo.findOne({
      where: { id, tenantId },
      relations: ['items', 'items.product', 'shippingAddress'],
    })
  }

  async countByTenant(tenantId: string): Promise<number> {
    return await this.repo.count({ where: { tenantId } })
  }

  async saveOrder(order: OrderEntity): Promise<OrderEntity> {
    return await this.repo.save(order)
  }
  async findAllOrders(filterDto: any, tenantId: string): Promise<{ orders: OrderEntity[]; total: number }> {
    // this.logger.log(`${this.findAllOrders.name} Service Called`)
    const { page, limit, search, status } = filterDto

    const skip = (page - 1) * limit

    const queryBuilder = this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('order.tenantId = :tenantId', { tenantId })

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status })
    }

    if (search) {
      queryBuilder.andWhere(
        '(order.customerName ILIKE :search OR order.customerEmail ILIKE :search OR order.customerPhone ILIKE :search OR CAST(order.id AS TEXT) ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    const [orders, total] = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      orders,
      total,
    }
  }

  async findByUserId(userId: string, tenantId: string, search?: string): Promise<OrderEntity[]> {
    // this.logger.log(`${this.findByUserId.name} Service Called`)
    const queryBuilder = this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('items.variant', 'variant')
      .leftJoinAndSelect('order.returns', 'returns')
      .leftJoinAndSelect('order.shippingAddress', 'shippingAddress')
      .where('order.userId = :userId', { userId })
      .andWhere('order.tenantId = :tenantId', { tenantId })

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('order.customerName ILIKE :search', { search: `%${search}%` })
            .orWhere('order.customerEmail ILIKE :search', { search: `%${search}%` })
            .orWhere('order.customerPhone ILIKE :search', { search: `%${search}%` })
            .orWhere('CAST(order.id AS TEXT) ILIKE :search', { search: `%${search}%` })
            .orWhere('product.name ILIKE :search', { search: `%${search}%` })
        }),
      )
    }

    return await queryBuilder.orderBy('order.createdAt', 'DESC').getMany()
  }
  async orderOverview(tenantId?: string): Promise<{ totalOrders: number; pendingOrders: number; completedOrders: number; cancelledOrders: number }> {
    // this.logger.log(`${this.orderOverview.name} Service Called`)
    const where = tenantId ? { tenantId } : {}
    const totalOrders = await this.repo.count({ where })
    const pendingOrders = await this.repo.count({
      where: { ...where, status: OrderStatus.PENDING },
    })
    const completedOrders = await this.repo.count({
      where: { ...where, status: OrderStatus.COMPLETED },
    })
    const cancelledOrders = await this.repo.count({
      where: { ...where, status: OrderStatus.CANCELLED },
    })
    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
    }
  }

}
