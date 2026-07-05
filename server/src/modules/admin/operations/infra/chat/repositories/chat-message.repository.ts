import { BaseStoreRepository } from '@/common/base-repository'
import { ChatMessageEntity } from '@/modules/admin/operations/infra/chat/entities/chat-message.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class ChatMessageRepository extends BaseStoreRepository<ChatMessageEntity> {
  constructor(
    @InjectRepository(ChatMessageEntity)
    repo: Repository<ChatMessageEntity>,
  ) {
    super(ChatMessageEntity, repo)
  }

  create(data: DeepPartial<ChatMessageEntity>): ChatMessageEntity {
    return this.repo.create(data)
  }

  async save(entity: any): Promise<any> {
    return this.repo.save(entity)
  }

  async find(options?: FindManyOptions<ChatMessageEntity>): Promise<ChatMessageEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<ChatMessageEntity>): Promise<ChatMessageEntity | null> {
    return this.repo.findOne(options)
  }
}
