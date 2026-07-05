import { BaseStoreRepository } from '@/common/base-repository'
import { ProductBatchEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/product-batch.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class ProductBatchRepository extends BaseStoreRepository<ProductBatchEntity> {
  constructor(
    @InjectRepository(ProductBatchEntity)
    repo: Repository<ProductBatchEntity>,
  ) {
    super(ProductBatchEntity, repo)
  }

  create(data: DeepPartial<ProductBatchEntity>): ProductBatchEntity {
    return this.repo.create(data)
  }

  async save(entity: ProductBatchEntity): Promise<ProductBatchEntity> {
    return this.repo.save(entity)
  }

  async find(options?: FindManyOptions<ProductBatchEntity>): Promise<ProductBatchEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<ProductBatchEntity>): Promise<ProductBatchEntity | null> {
    return this.repo.findOne(options)
  }
}
