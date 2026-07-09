import { BaseStoreRepository } from '@/common/base-repository'
import { LeadEntity } from '@/modules/admin/customer/lead/entities/lead.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindManyOptions, Repository } from 'typeorm'

@Injectable()
export class LeadRepository extends BaseStoreRepository<LeadEntity> {
  constructor(
    @InjectRepository(LeadEntity)
    repo: Repository<LeadEntity>,
  ) {
    super(LeadEntity, repo)
  }

  async find(options?: FindManyOptions<LeadEntity>): Promise<LeadEntity[]> {
    return this.repo.find(options)
  }
}
