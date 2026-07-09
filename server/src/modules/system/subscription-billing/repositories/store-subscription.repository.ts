import { BaseStoreRepository } from '@/common/base-repository'
import { StoreSubscriptionEntity } from '@/modules/system/store/entities/store-subscription.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class StoreSubscriptionRepository extends BaseStoreRepository<StoreSubscriptionEntity> {
  constructor(
    @InjectRepository(StoreSubscriptionEntity)
    repo: Repository<StoreSubscriptionEntity>,
  ) {
    super(StoreSubscriptionEntity, repo)
  }

  create(data: DeepPartial<StoreSubscriptionEntity>): StoreSubscriptionEntity {
    return this.repo.create(data)
  }

  async save(subscription: StoreSubscriptionEntity): Promise<StoreSubscriptionEntity> {
    return this.repo.save(subscription)
  }

  async find(options?: FindManyOptions<StoreSubscriptionEntity>): Promise<StoreSubscriptionEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<StoreSubscriptionEntity>): Promise<StoreSubscriptionEntity | null> {
    return this.repo.findOne(options)
  }
}
