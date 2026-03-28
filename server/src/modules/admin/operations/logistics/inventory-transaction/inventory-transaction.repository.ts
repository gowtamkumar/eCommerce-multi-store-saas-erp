import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { InventoryTransactionEntity } from './entities/inventory-transaction.entity'

@Injectable()
export class InventoryTransactionRepository extends Repository<InventoryTransactionEntity> {
  constructor(private dataSource: DataSource) {
    super(InventoryTransactionEntity, dataSource.createEntityManager())
  }

  async findByTenant(tenantId: string): Promise<InventoryTransactionEntity[]> {
    return await this.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      relations: ['product'],
    })
  }

  async findByProduct(productId: string, tenantId: string): Promise<InventoryTransactionEntity[]> {
    return await this.find({
      where: { productId, tenantId },
      order: { createdAt: 'DESC' },
    })
  }

  async createAndSave(dto: any, tenantId: string, manager?: any): Promise<InventoryTransactionEntity> {
    const repo = manager ? manager.getRepository(InventoryTransactionEntity) : this
    const transaction = repo.create({ ...dto, tenantId })
    return await repo.save(transaction)
  }
}
