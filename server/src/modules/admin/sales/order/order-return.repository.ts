import { ReturnStatus } from '@/common/enums/return-status.enum'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { OrderReturnEntity } from './entities/order-return.entity'

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

  async findAllWithRelations(tenantId: string): Promise<OrderReturnEntity[]> {
    return await this.repo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      relations: ['order', 'order.items', 'order.items.product', 'order.items.variant', 'user'],
    })
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
