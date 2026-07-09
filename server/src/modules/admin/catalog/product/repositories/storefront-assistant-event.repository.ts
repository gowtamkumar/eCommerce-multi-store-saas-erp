import { BaseStoreRepository } from '@/common/base-repository'
import { StorefrontAssistantEventEntity } from '@/modules/admin/catalog/product/entities/storefront-assistant-event.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, SelectQueryBuilder } from 'typeorm'

@Injectable()
export class StorefrontAssistantEventRepository extends BaseStoreRepository<StorefrontAssistantEventEntity> {
  constructor(
    @InjectRepository(StorefrontAssistantEventEntity)
    repo: Repository<StorefrontAssistantEventEntity>,
  ) {
    super(StorefrontAssistantEventEntity, repo)
  }

  async insert(entity: any): Promise<any> {
    return this.repo.insert(entity)
  }

  createQueryBuilder(alias: string): SelectQueryBuilder<StorefrontAssistantEventEntity> {
    return this.repo.createQueryBuilder(alias)
  }
}
