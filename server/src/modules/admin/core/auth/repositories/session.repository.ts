import { BaseStoreRepository } from '@/common/base-repository'
import { SessionEntity } from '@/modules/admin/core/auth/entities/session.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class SessionRepository extends BaseStoreRepository<SessionEntity> {
  constructor(
    @InjectRepository(SessionEntity)
    repo: Repository<SessionEntity>,
  ) {
    super(SessionEntity, repo)
  }

  create(data: DeepPartial<SessionEntity>): SessionEntity {
    return this.repo.create(data)
  }

  async save(session: DeepPartial<SessionEntity>): Promise<SessionEntity> {
    return this.repo.save(session)
  }

  async find(options?: FindManyOptions<SessionEntity>): Promise<SessionEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<SessionEntity>): Promise<SessionEntity | null> {
    return this.repo.findOne(options)
  }

  async update(criteria: any, partialEntity: DeepPartial<SessionEntity>): Promise<void> {
    await this.repo.update(criteria, partialEntity)
  }
}
