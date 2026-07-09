import { BaseStoreRepository } from '@/common/base-repository'
import { AiUsageLogEntity } from '@/modules/admin/ai/entities/ai-usage-log.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class AiUsageLogRepository extends BaseStoreRepository<AiUsageLogEntity> {
  constructor(
    @InjectRepository(AiUsageLogEntity)
    repo: Repository<AiUsageLogEntity>,
  ) {
    super(AiUsageLogEntity, repo)
  }

  async insert(data: any): Promise<any> {
    return this.repo.insert(data)
  }

  createQueryBuilder(alias: string): any {
    return this.repo.createQueryBuilder(alias)
  }
}
