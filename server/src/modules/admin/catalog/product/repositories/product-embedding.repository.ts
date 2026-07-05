import { BaseStoreRepository } from '@/common/base-repository'
import { ProductEmbeddingEntity } from '@/modules/admin/catalog/product/entities/product-embedding.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, In, Repository, SelectQueryBuilder } from 'typeorm'

@Injectable()
export class ProductEmbeddingRepository extends BaseStoreRepository<ProductEmbeddingEntity> {
  constructor(
    @InjectRepository(ProductEmbeddingEntity)
    repo: Repository<ProductEmbeddingEntity>,
  ) {
    super(ProductEmbeddingEntity, repo)
  }

  async count(options?: any): Promise<number> {
    return this.repo.count(options)
  }

  async findOne(options: FindOneOptions<ProductEmbeddingEntity>): Promise<ProductEmbeddingEntity | null> {
    return this.repo.findOne(options)
  }

  async upsert(entity: any, conflictPaths: string[]): Promise<any> {
    return this.repo.upsert(entity, conflictPaths)
  }

  async delete(criteria: any): Promise<void> {
    await this.repo.delete(criteria)
  }

  createQueryBuilder(alias: string): SelectQueryBuilder<ProductEmbeddingEntity> {
    return this.repo.createQueryBuilder(alias)
  }
}
