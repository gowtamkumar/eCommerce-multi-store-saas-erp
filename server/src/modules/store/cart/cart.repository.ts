import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { CartEntity } from './entities/cart.entity'

@Injectable()
export class CartRepository extends Repository<CartEntity> {
  constructor(private dataSource: DataSource) {
    super(CartEntity, dataSource.createEntityManager())
  }

  async findByUserId(userId: string, tenantId: string): Promise<CartEntity | null> {
    return await this.findOne({
      where: { userId, tenantId },
      relations: ['items', 'items.product', 'items.variant'],
    })
  }

  async createAndSave(userId: string, tenantId: string): Promise<CartEntity> {
    const cart = this.create({
      userId,
      tenantId,
      items: [],
    })
    return await this.save(cart)
  }

  async saveCart(cart: CartEntity): Promise<CartEntity> {
    return await this.save(cart)
  }

  async updateCoupon(cart: CartEntity, code: string | null): Promise<CartEntity> {
    cart.appliedCouponCode = code ? code.toUpperCase() : null
    return await this.save(cart)
  }
}
