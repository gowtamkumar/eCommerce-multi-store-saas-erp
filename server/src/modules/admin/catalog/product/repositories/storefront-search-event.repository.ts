import { BaseStoreRepository } from '@/common/base-repository'
import { StorefrontSearchEventEntity } from '@/modules/admin/catalog/product/entities/storefront-search-event.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, SelectQueryBuilder } from 'typeorm'

@Injectable()
export class StorefrontSearchEventRepository extends BaseStoreRepository<StorefrontSearchEventEntity> {
  constructor(
    @InjectRepository(StorefrontSearchEventEntity)
    repo: Repository<StorefrontSearchEventEntity>,
  ) {
    super(StorefrontSearchEventEntity, repo)
  }

  async insert(entity: any): Promise<any> {
    return this.repo.insert(entity)
  }

  createQueryBuilder(alias: string): SelectQueryBuilder<StorefrontSearchEventEntity> {
    return this.repo.createQueryBuilder(alias)
  }
}
