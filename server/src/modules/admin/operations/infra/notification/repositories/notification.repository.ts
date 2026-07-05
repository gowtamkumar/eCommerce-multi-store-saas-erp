import { BaseStoreRepository } from '@/common/base-repository'
import { NotificationEntity } from '@/modules/admin/operations/infra/notification/entities/notification.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class NotificationRepository extends BaseStoreRepository<NotificationEntity> {
  constructor(
    @InjectRepository(NotificationEntity)
    repo: Repository<NotificationEntity>,
  ) {
    super(NotificationEntity, repo)
  }

  create(data: DeepPartial<NotificationEntity>): NotificationEntity {
    return this.repo.create(data)
  }

  async save(entity: any): Promise<any> {
    return this.repo.save(entity)
  }

  async find(options?: FindManyOptions<NotificationEntity>): Promise<NotificationEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<NotificationEntity>): Promise<NotificationEntity | null> {
    return this.repo.findOne(options)
  }

  async update(criteria: any, partialEntity: DeepPartial<NotificationEntity>): Promise<void> {
    await this.repo.update(criteria, partialEntity)
  }
}
