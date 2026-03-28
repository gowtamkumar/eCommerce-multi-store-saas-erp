import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { CartItemEntity } from './entities/cart-item.entity'

@Injectable()
export class CartItemRepository extends Repository<CartItemEntity> {
  constructor(private dataSource: DataSource) {
    super(CartItemEntity, dataSource.createEntityManager())
  }

  async findByIdWithCart(id: string, tenantId: string): Promise<CartItemEntity | null> {
    return await this.findOne({
      where: { id, tenantId },
      relations: ['cart'],
    })
  }

  async findByProduct(
    cartId: string,
    productId: string,
    variantId: string | null,
    tenantId: string,
  ): Promise<CartItemEntity | null> {
    return await this.findOne({
      where: { cartId, productId, variantId, tenantId },
    })
  }

  async createAndSave(dto: any): Promise<CartItemEntity> {
    const cartItem = this.create(dto as any) as unknown as CartItemEntity
    return await (this.save(cartItem) as Promise<CartItemEntity>)
  }

  async updateQuantity(cartItem: CartItemEntity, quantity: number): Promise<CartItemEntity> {
    cartItem.quantity = quantity
    return await this.save(cartItem)
  }

  async removeItems(items: CartItemEntity | CartItemEntity[]): Promise<void> {
    if (Array.isArray(items)) {
      if (items.length > 0) await this.remove(items)
    } else {
      await this.remove(items)
    }
  }
}
