import { BaseStoreRepository } from '@/common/base-repository'
import { ConversationEntity } from '@/modules/admin/operations/infra/chat/entities/conversation.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class ConversationRepository extends BaseStoreRepository<ConversationEntity> {
  constructor(
    @InjectRepository(ConversationEntity)
    repo: Repository<ConversationEntity>,
  ) {
    super(ConversationEntity, repo)
  }

  create(data: DeepPartial<ConversationEntity>): ConversationEntity {
    return this.repo.create(data)
  }

  async save(entity: any): Promise<any> {
    return this.repo.save(entity)
  }

  async find(options?: FindManyOptions<ConversationEntity>): Promise<ConversationEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<ConversationEntity>): Promise<ConversationEntity | null> {
    return this.repo.findOne(options)
  }
}
