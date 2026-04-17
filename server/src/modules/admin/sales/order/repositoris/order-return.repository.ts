import { ReturnStatus } from '@/common/enums/return-status.enum'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, Repository } from 'typeorm'
import { FilterReturnDto } from '../dto/filter-return.dto'

import { OrderReturnEntity } from '../entities/order-return.entity'

@Injectable()
export class OrderReturnRepository {
  constructor(
    @InjectRepository(OrderReturnEntity)
    private readonly repo: Repository<OrderReturnEntity>,
  ) { }

  async createAndSaveReturn(
    dto: any,
    userId: string,
    tenantId: string,
  ): Promise<OrderReturnEntity> {
    const returnRequest = this.repo.create({
      ...dto,
      userId,
      tenantId,
      status: ReturnStatus.PENDING,
    } as any) as unknown as OrderReturnEntity
    return await (this.repo.save(returnRequest) as Promise<OrderReturnEntity>)
  }

  /**
   * Fetches paginated return requests for the admin dashboard with filtering and search.
   * Optimized to only fetch necessary fields for the table view.
   */
  async findPaginated(
    tenantId: string,
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
      .where('ret.tenantId = :tenantId', { tenantId })

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


  async findByUserWithRelations(userId: string, tenantId: string): Promise<OrderReturnEntity[]> {
    return await this.repo.find({
      where: { userId, tenantId },
      order: { createdAt: 'DESC' },
      relations: ['order'],
    })
  }

  async findByIdWithRelations(id: string, tenantId: string): Promise<OrderReturnEntity | null> {
    return await this.repo.findOne({
      where: { id, tenantId },
      relations: ['order', 'order.items', 'order.items.product', 'order.items.variant', 'user'],
    })
  }

  async findById(id: string, tenantId: string): Promise<OrderReturnEntity | null> {
    return await this.repo.findOne({
      where: { id, tenantId },
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

}
