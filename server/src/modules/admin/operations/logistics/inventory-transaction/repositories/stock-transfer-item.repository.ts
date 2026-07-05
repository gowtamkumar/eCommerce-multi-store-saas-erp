import { BaseStoreRepository } from '@/common/base-repository'
import { StockTransferItemEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/stock-transfer-item.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class StockTransferItemRepository extends BaseStoreRepository<StockTransferItemEntity> {
  constructor(
    @InjectRepository(StockTransferItemEntity)
    repo: Repository<StockTransferItemEntity>,
  ) {
    super(StockTransferItemEntity, repo)
  }

  create(data: DeepPartial<StockTransferItemEntity>): StockTransferItemEntity {
    return this.repo.create(data)
  }

  async save(entity: any): Promise<any> {
    return this.repo.save(entity)
  }

  async find(options?: FindManyOptions<StockTransferItemEntity>): Promise<StockTransferItemEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<StockTransferItemEntity>): Promise<StockTransferItemEntity | null> {
    return this.repo.findOne(options)
  }

  async softRemove(entities: any[]): Promise<any[]> {
    return this.repo.softRemove(entities)
  }
}
