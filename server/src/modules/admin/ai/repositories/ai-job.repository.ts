import { BaseStoreRepository } from '@/common/base-repository'
import { AiJobEntity } from '@/modules/admin/ai/entities/ai-job.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindOneOptions, Repository, SelectQueryBuilder } from 'typeorm'

@Injectable()
export class AiJobRepository extends BaseStoreRepository<AiJobEntity> {
  constructor(
    @InjectRepository(AiJobEntity)
    repo: Repository<AiJobEntity>,
  ) {
    super(AiJobEntity, repo)
  }

  async save(entity: any): Promise<any> {
    return this.repo.save(entity)
  }

  create(data: DeepPartial<AiJobEntity>): AiJobEntity {
    return this.repo.create(data)
  }

  async findOne(options: FindOneOptions<AiJobEntity>): Promise<AiJobEntity | null> {
    return this.repo.findOne(options)
  }

  async update(criteria: any, data: any): Promise<any> {
    return this.repo.update(criteria, data)
  }

  createQueryBuilder(alias: string): SelectQueryBuilder<AiJobEntity> {
    return this.repo.createQueryBuilder(alias)
  }
}
