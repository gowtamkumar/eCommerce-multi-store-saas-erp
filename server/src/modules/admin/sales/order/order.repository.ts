import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OrderEntity } from './entities/order.entity'

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

}
