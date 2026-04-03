import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { PurchaseOrderEntity } from './entities/purchase-order.entity'

@Injectable()
export class PurchaseOrderRepository {
  constructor(
    @InjectRepository(PurchaseOrderEntity)
    private readonly repo: Repository<PurchaseOrderEntity>,
  ) { }

  private getRepo(manager?: EntityManager): Repository<PurchaseOrderEntity> {
    return manager ? manager.getRepository(PurchaseOrderEntity) : this.repo
  }

  async createAndSave(dto: any, tenantId: string, status: any): Promise<PurchaseOrderEntity> {
    const order = this.repo.create({
      ...dto,
      tenantId,
      status,
    } as PurchaseOrderEntity)
    return this.repo.save(order)
  }

  async findAllWithRelations(tenantId: string): Promise<PurchaseOrderEntity[]> {
    return this.repo.find({
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
    return this.repo.find({
      where: { supplierId, tenantId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    })
  }
}
