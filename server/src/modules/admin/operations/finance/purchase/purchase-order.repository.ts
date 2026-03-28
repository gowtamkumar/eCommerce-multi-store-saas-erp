import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { PurchaseOrderEntity } from './entities/purchase-order.entity'

@Injectable()
export class PurchaseOrderRepository extends Repository<PurchaseOrderEntity> {
  constructor(private dataSource: DataSource) {
    super(PurchaseOrderEntity, dataSource.createEntityManager())
  }

  private getRepo(manager?: EntityManager): Repository<PurchaseOrderEntity> {
    return manager ? manager.getRepository(PurchaseOrderEntity) : this
  }

  async createAndSave(dto: any, tenantId: string, status: any): Promise<PurchaseOrderEntity> {
    const order = this.create({
      ...dto,
      tenantId,
      status,
    } as PurchaseOrderEntity)
    return this.save(order)
  }

  async findAllWithRelations(tenantId: string): Promise<PurchaseOrderEntity[]> {
    return this.find({
      where: { tenantId },
      relations: ['supplier'],
      order: { createdAt: 'DESC' },
    })
  }

  async findByIdWithRelations(
    id: string,
    tenantId: string,
    manager?: EntityManager,
  ): Promise<PurchaseOrderEntity | null> {
    const repo = this.getRepo(manager)
    return repo.findOne({
      where: { id, tenantId },
      relations: ['supplier', 'items', 'items.product', 'items.variant', 'payments'],
    })
  }

  async saveOrder(
    order: PurchaseOrderEntity,
    manager?: EntityManager,
  ): Promise<PurchaseOrderEntity> {
    const repo = this.getRepo(manager)
    return repo.save(order)
  }

  async findAllBySupplier(supplierId: string, tenantId: string): Promise<PurchaseOrderEntity[]> {
    return this.find({
      where: { supplierId, tenantId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    })
  }
}
