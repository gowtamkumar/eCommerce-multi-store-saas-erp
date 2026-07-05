import { BaseStoreRepository } from '@/common/base-repository'
import { ProductPriceEntity } from '@/modules/admin/catalog/pricing/entities/product-price.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class ProductPriceRepository extends BaseStoreRepository<ProductPriceEntity> {
  constructor(
    @InjectRepository(ProductPriceEntity)
    repo: Repository<ProductPriceEntity>,
  ) {
    super(ProductPriceEntity, repo)
  }

  create(data: DeepPartial<ProductPriceEntity>): ProductPriceEntity {
    return this.repo.create(data)
  }

  async save(entity: any): Promise<any> {
    return this.repo.save(entity)
  }

  async find(options?: FindManyOptions<ProductPriceEntity>): Promise<ProductPriceEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<ProductPriceEntity>): Promise<ProductPriceEntity | null> {
    return this.repo.findOne(options)
  }

  async remove(entity: ProductPriceEntity): Promise<ProductPriceEntity> {
    return this.repo.remove(entity)
  }
}
