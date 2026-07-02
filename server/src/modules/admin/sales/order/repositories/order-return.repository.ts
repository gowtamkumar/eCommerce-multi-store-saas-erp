import { BaseStoreRepository } from '@/common/base-repository'
import { ReturnStatus } from '@/common/enums/return-status.enum'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, EntityManager, Repository } from 'typeorm'
import { FilterReturnDto } from '../dto/filter-return.dto'

import { RequestContextDto } from '@/common/dto/request-context.dto'
import { OrderReturnEntity } from '../entities/order-return.entity'
import { ReturnType } from '@/common/enums/refund-method.enum'

@Injectable()
export class OrderReturnRepository extends BaseStoreRepository<OrderReturnEntity> {
  constructor(
    @InjectRepository(OrderReturnEntity)
    repo: Repository<OrderReturnEntity>,
  ) {
    super(OrderReturnEntity, repo)
}

  async createAndSaveReturn(
    dto: any,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<OrderReturnEntity> {
    const repo = manager ? manager.getRepository(OrderReturnEntity) : this.repo
    const returnRequest = repo.create({
      ...dto,
      userId: ctx.userId,
      storeId: ctx.storeId,
      status: ReturnStatus.PENDING,
    } as any) as unknown as OrderReturnEntity
    return await (repo.save(returnRequest) as Promise<OrderReturnEntity>)
  }

  /**
   * Fetches paginated return requests for the admin dashboard with filtering and search.
   * Optimized to only fetch necessary fields for the table view.
   */
  async findPaginated(
    storeId: string,
    filterDto: FilterReturnDto,
  ): Promise<{ data: OrderReturnEntity[]; total: number }> {
    const { page, limit, search, status, orderId } = filterDto
    const skip = (page - 1) * limit

    const queryBuilder = this.repo
      .createQueryBuilder('ret')
      .leftJoin('ret.order', 'order')
      .leftJoin('ret.user', 'user')
      .addSelect(['order.id', 'order.customerName', 'order.customerEmail', 'order.customerPhone'])
      .addSelect(['user.email'])
      .where('ret.storeId = :storeId', { storeId })

    if (status) {
      queryBuilder.andWhere('ret.status = :status', { status })
    }

    if (orderId) {
      queryBuilder.andWhere('ret.orderId = :orderId', { orderId })
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('order.customerName ILIKE :search', { search: `%${search}%` })
            .orWhere('order.customerEmail ILIKE :search', { search: `%${search}%` })
            .orWhere('order.customerPhone ILIKE :search', { search: `%${search}%` })
            .orWhere('user.email ILIKE :search', { search: `%${search}%` })
            .orWhere('CAST(ret.orderId AS TEXT) ILIKE :search', { search: `%${search}%` })
            .orWhere('ret.reason ILIKE :search', { search: `%${search}%` })
        }),
      )
    }

    const [data, total] = await queryBuilder
      .orderBy('ret.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return { data, total }
  }

  async findByUserWithRelations(userId: string, storeId: string): Promise<OrderReturnEntity[]> {
    return await this.repo.find({
      where: { userId, storeId },
      order: { createdAt: 'DESC' },
      relations: {
        order: true,
      },
    })
  }

  async findByIdWithRelations(id: string, storeId: string): Promise<OrderReturnEntity | null> {
    return await this.repo.findOne({
      where: { id, storeId },
      relations: {
        order: {
          items: {
            product: true,
            variant: true,
          },
        },
        user: true,
      },
    })
  }

  async findById(id: string, storeId: string): Promise<OrderReturnEntity | null> {
    return await this.repo.findOne({
      where: { id, storeId },
    })
  }

  async updateStatus(
    returnRequest: OrderReturnEntity,
    status: ReturnStatus,
    adminComment?: string,
  ): Promise<OrderReturnEntity> {
    returnRequest.status = status
    if (adminComment) {
      returnRequest.adminComment = adminComment
    }
    return await this.repo.save(returnRequest)
  }

  /** Sets receivedAt timestamp and transitions status → RECEIVED. */
  async markReceived(returnRequest: OrderReturnEntity): Promise<OrderReturnEntity> {
    returnRequest.receivedAt = new Date()
    returnRequest.status = ReturnStatus.RECEIVED
    return await this.repo.save(returnRequest)
  }

  /** Links a new order ID to the return as the exchange fulfillment order. */
  async linkExchange(
    returnRequest: OrderReturnEntity,
    newOrderId: string,
  ): Promise<OrderReturnEntity> {
    returnRequest.exchangeOrderId = newOrderId
    returnRequest.returnType = ReturnType.EXCHANGE
    returnRequest.status = ReturnStatus.EXCHANGED
    return await this.repo.save(returnRequest)
  }
}
