import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { OrderEntity } from './entities/order.entity'

@Injectable()
export class OrderRepository extends Repository<OrderEntity> {
  constructor(private dataSource: DataSource) {
    super(OrderEntity, dataSource.createEntityManager())
  }

  async findOrderById(id: string, tenantId: string): Promise<OrderEntity | null> {
    return await this.findOne({
      where: { id, tenantId },
      relations: ['items', 'items.product', 'items.variant', 'returns', 'shippingAddress'],
    })
  }

  async findOrderByTransactionId(transactionId: string): Promise<OrderEntity | null> {
    return await this.findOne({
      where: { transactionId },
    })
  }

  async findOneForCourier(id: string, tenantId: string): Promise<OrderEntity | null> {
    return await this.findOne({
      where: { id, tenantId },
      relations: ['items', 'items.product', 'shippingAddress'],
    })
  }

  async countByTenant(tenantId: string): Promise<number> {
    return await this.count({ where: { tenantId } })
  }

  async saveOrder(order: OrderEntity): Promise<OrderEntity> {
    return await this.save(order)
  }
}
