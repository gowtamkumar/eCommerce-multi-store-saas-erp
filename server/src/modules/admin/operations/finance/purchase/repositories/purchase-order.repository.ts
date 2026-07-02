import { BaseStoreRepository } from '@/common/base-repository'
import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { PurchaseOrderEntity } from '../entities/purchase-order.entity'
import { PurchaseOrderPaymentStatus } from '../enums/purchase-order-payment-status.enum'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class PurchaseOrderRepository extends BaseStoreRepository<PurchaseOrderEntity> {
  constructor(
    @InjectRepository(PurchaseOrderEntity)
    repo: Repository<PurchaseOrderEntity>,
  ) {
    super(PurchaseOrderEntity, repo)
}

  private getRepo(manager?: EntityManager): Repository<PurchaseOrderEntity> {
    return this.txRepo(manager)
  }

  async createAndSave(
    data: Partial<PurchaseOrderEntity>,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<PurchaseOrderEntity> {
    const repo = this.getRepo(manager)
    const purchaseOrder = repo.create({
      ...data,
      storeId: ctx.storeId,
      userId: ctx.userId,
    } as PurchaseOrderEntity)
    return repo.save(purchaseOrder)
  }

  /**
   * Fetches paginated purchase orders with optimized relations.
   * Supports server-side filtering by status and searching on reference #.
   */
  async findAllByStore(
    storeId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: PurchaseOrderStatus,
    paymentStatus?: PurchaseOrderPaymentStatus,
  ): Promise<[PurchaseOrderEntity[], number]> {
    const qb = this.repo
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.supplier', 'supplier')
      .leftJoinAndSelect('po.user', 'user')
      .where('po.storeId = :storeId', { storeId })
      .orderBy('po.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    if (search) {
      qb.andWhere('po.referenceNumber ILIKE :search', { search: `%${search}%` })
    }

    if (status) {
      qb.andWhere('po.status = :status', { status })
    }

    if (paymentStatus) {
      qb.andWhere('po.paymentStatus = :paymentStatus', { paymentStatus })
    }

    return await qb.getManyAndCount()
  }

  async findByIdWithRelations(
    id: string,
    storeId: string,
    manager?: EntityManager,
  ): Promise<PurchaseOrderEntity | null> {
    const repo = this.getRepo(manager)
    return await repo.findOne({
      where: { id, storeId },
      relations: {
        supplier: true,
        items: {
          product: true,
          variant: true,
        },
        payments: true,
        user: true,
      },
    })
  }

  async findById(
    id: string,
    storeId: string,
    manager?: EntityManager,
  ): Promise<PurchaseOrderEntity | null> {
    const repo = this.getRepo(manager)
    return await repo.findOne({
      where: { id, storeId },
    })
  }

  async savePurchaseOrder(
    order: PurchaseOrderEntity,
    manager?: EntityManager,
  ): Promise<PurchaseOrderEntity> {
    const repo = this.getRepo(manager)
    return await repo.save(order)
  }

  async findAllBySupplier(supplierId: string, storeId: string): Promise<PurchaseOrderEntity[]> {
    return await this.repo.find({
      where: { supplierId, storeId },
      relations: {
        items: true,
      },
      order: { createdAt: 'DESC' },
    })
  }
}
