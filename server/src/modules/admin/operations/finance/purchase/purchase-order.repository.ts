import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { PurchaseOrderEntity } from './entities/purchase-order.entity'
import { PurchaseOrderPaymentStatus } from './enums/purchase-order-payment-status.enum'

@Injectable()
export class PurchaseOrderRepository {
  constructor(
    @InjectRepository(PurchaseOrderEntity)
    private readonly repo: Repository<PurchaseOrderEntity>,
  ) { }

  private getRepo(manager?: EntityManager): Repository<PurchaseOrderEntity> {
    return manager ? manager.getRepository(PurchaseOrderEntity) : this.repo
  }

  async createAndSave(
    data: Partial<PurchaseOrderEntity>,
    manager?: EntityManager,
  ): Promise<PurchaseOrderEntity> {
    const repo = this.getRepo(manager)
    console.log("purchase order repo", repo);
    
    const purchaseOrder = repo.create(data as PurchaseOrderEntity)
    console.log("purchaseOrder", purchaseOrder);
    
    return repo.save(purchaseOrder)
  }

  /**
   * Fetches paginated purchase orders with optimized relations.
   * Supports server-side filtering by status and searching on reference #.
   */
  async findAllByTenant(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: PurchaseOrderStatus,
    paymentStatus?: PurchaseOrderPaymentStatus,
  ): Promise<[PurchaseOrderEntity[], number]> {
    const qb = this.repo.createQueryBuilder('po')
      .leftJoinAndSelect('po.supplier', 'supplier')
      .leftJoinAndSelect('po.user', 'user')
      .where('po.tenantId = :tenantId', { tenantId })
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
    tenantId: string,
    manager?: EntityManager,
  ): Promise<PurchaseOrderEntity | null> {
    const repo = this.getRepo(manager)
    return await repo.findOne({
      where: { id, tenantId },
      relations: ['supplier', 'items', 'items.product', 'items.variant', 'payments', 'user'],
    })
  }

  async saveOrder(
    order: PurchaseOrderEntity,
    manager?: EntityManager,
  ): Promise<PurchaseOrderEntity> {
    const repo = this.getRepo(manager)
    return await repo.save(order)
  }

  async findAllBySupplier(supplierId: string, tenantId: string): Promise<PurchaseOrderEntity[]> {
    return await this.repo.find({
      where: { supplierId, tenantId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    })
  }
}
