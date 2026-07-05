import { BaseStoreRepository } from '@/common/base-repository'
import { StoreFeatureEntity } from '@/modules/system/store/entities/store-feature.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class StoreFeatureRepository extends BaseStoreRepository<StoreFeatureEntity> {
  constructor(
    @InjectRepository(StoreFeatureEntity)
    repo: Repository<StoreFeatureEntity>,
  ) {
    super(StoreFeatureEntity, repo)
  }

  create(data: DeepPartial<StoreFeatureEntity>): StoreFeatureEntity {
    return this.repo.create(data)
  }

  async save(feature: StoreFeatureEntity): Promise<StoreFeatureEntity> {
    return this.repo.save(feature)
  }

  async find(options?: FindManyOptions<StoreFeatureEntity>): Promise<StoreFeatureEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<StoreFeatureEntity>): Promise<StoreFeatureEntity | null> {
    return this.repo.findOne(options)
  }
}
