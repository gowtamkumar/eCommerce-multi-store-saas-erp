import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CartItemEntity } from './entities/cart-item.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class CartItemRepository {
  constructor(
    @InjectRepository(CartItemEntity)
    private readonly repo: Repository<CartItemEntity>,
  ) {}

  async findByIdWithCart(id: string, tenantId: string): Promise<CartItemEntity | null> {
    return await this.repo.findOne({
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
    return await this.repo.findOne({
      where: { cartId, productId, variantId, tenantId },
    })
  }

  async createAndSave(dto: any, ctx: RequestContextDto): Promise<CartItemEntity> {
    const cartItem = this.repo.create({
      ...dto,
      tenantId: ctx.tenantId,
    } as any) as unknown as CartItemEntity
    return await (this.repo.save(cartItem) as Promise<CartItemEntity>)
  }

  async updateQuantity(cartItem: CartItemEntity, quantity: number): Promise<CartItemEntity> {
    cartItem.quantity = quantity
    return await this.repo.save(cartItem)
  }

  async removeItems(items: CartItemEntity | CartItemEntity[]): Promise<void> {
    if (Array.isArray(items)) {
      if (items.length > 0) await this.repo.remove(items)
    } else {
      await this.repo.remove(items)
    }
  }
}
