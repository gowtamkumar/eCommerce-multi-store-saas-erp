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
  ) {}

  async findByUserId(userId: string, tenantId: string): Promise<CartEntity | null> {
    return await this.repo.findOne({
      where: { userId, tenantId },
      relations: {
        items: {
          product: true,
          variant: true,
        },
      },
    })
  }

  async findAllAdminPaginated(
    tenantId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ carts: CartEntity[]; total: number }> {
    const queryWithItems = this.repo
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.user', 'user')
      .innerJoinAndSelect('cart.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('cart.tenantId = :tenantId', { tenantId })

    if (search) {
      queryWithItems.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    queryWithItems.orderBy('cart.updatedAt', 'DESC')
    queryWithItems.skip((page - 1) * limit).take(limit)

    const [carts, total] = await queryWithItems.getManyAndCount()
    return { carts, total }
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
