import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CartEntity } from './entities/cart.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(CartEntity)
    private readonly repo: Repository<CartEntity>,
  ) { }

  async findByUserId(userId: string, tenantId: string): Promise<CartEntity | null> {
    return await this.repo.findOne({
      where: { userId, tenantId },
      relations: ['items', 'items.product', 'items.variant'],
    })
  }

  async createAndSave(ctx: RequestContextDto): Promise<CartEntity> {
    const cart = this.repo.create({
      userId: ctx.userId,
      tenantId: ctx.tenantId,
      items: [],
    })
    return await this.repo.save(cart)
  }

  async saveCart(cart: CartEntity): Promise<CartEntity> {
    return await this.repo.save(cart)
  }

  async updateCoupon(cart: CartEntity, code: string | null): Promise<CartEntity> {
    cart.appliedCouponCode = code ? code.toUpperCase() : null
    return await this.repo.save(cart)
  }

}
