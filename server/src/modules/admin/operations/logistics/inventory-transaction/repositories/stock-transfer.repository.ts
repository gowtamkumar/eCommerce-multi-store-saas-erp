import { BaseStoreRepository } from '@/common/base-repository'
import { StockTransferEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/stock-transfer.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class StockTransferRepository extends BaseStoreRepository<StockTransferEntity> {
  constructor(
    @InjectRepository(StockTransferEntity)
    repo: Repository<StockTransferEntity>,
  ) {
    super(StockTransferEntity, repo)
  }

  create(data: DeepPartial<StockTransferEntity>): StockTransferEntity {
    return this.repo.create(data)
  }

  async save(entity: StockTransferEntity): Promise<StockTransferEntity> {
    return this.repo.save(entity)
  }

  async find(options?: FindManyOptions<StockTransferEntity>): Promise<StockTransferEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<StockTransferEntity>): Promise<StockTransferEntity | null> {
    return this.repo.findOne(options)
  }
}
