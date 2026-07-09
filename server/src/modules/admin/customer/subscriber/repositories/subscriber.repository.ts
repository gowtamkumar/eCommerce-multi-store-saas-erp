import { BaseStoreRepository } from '@/common/base-repository'
import { SubscriberEntity } from '@/modules/admin/customer/subscriber/entities/subscriber.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindManyOptions, Repository } from 'typeorm'

@Injectable()
export class SubscriberRepository extends BaseStoreRepository<SubscriberEntity> {
  constructor(
    @InjectRepository(SubscriberEntity)
    repo: Repository<SubscriberEntity>,
  ) {
    super(SubscriberEntity, repo)
  }

  async find(options?: FindManyOptions<SubscriberEntity>): Promise<SubscriberEntity[]> {
    return this.repo.find(options)
  }
}
