import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { InventoryTransactionEntity } from './entities/inventory-transaction.entity'

@Injectable()
export class InventoryTransactionRepository {
  constructor(
    @InjectRepository(InventoryTransactionEntity)
    private readonly repo: Repository<InventoryTransactionEntity>,
  ) { }

  async findByTenant(tenantId: string): Promise<InventoryTransactionEntity[]> {
    return await this.repo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      relations: ['variants', 'category', 'supplier']
    })
  }



  async findByProduct(productId: string, tenantId: string): Promise<InventoryTransactionEntity[]> {
    return await this.repo.find({
      where: { productId, tenantId },
      order: { createdAt: 'DESC' },
    })
  }

  async createAndSave(
    dto: any,
    tenantId: string,
    manager?: any,
  ): Promise<InventoryTransactionEntity> {
    const repo = manager ? manager.getRepository(InventoryTransactionEntity) : this.repo
    const transaction = repo.create({ ...dto, tenantId })
    return await repo.save(transaction)
  }
}
