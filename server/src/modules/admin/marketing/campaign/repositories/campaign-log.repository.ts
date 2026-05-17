import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CampaignLogEntity } from '../entities/campaign-log.entity'

@Injectable()
export class CampaignLogRepository {
  constructor(
    @InjectRepository(CampaignLogEntity)
    private readonly repo: Repository<CampaignLogEntity>,
  ) {}

  create(data: Partial<CampaignLogEntity>): CampaignLogEntity {
    return this.repo.create(data)
  }

  async save(log: CampaignLogEntity): Promise<CampaignLogEntity> {
    return this.repo.save(log)
  }

  async findLogsByCampaign(
    campaignId: string,
    skip: number,
    take: number,
  ): Promise<[CampaignLogEntity[], number]> {
    return this.repo.findAndCount({
      where: { campaignId },
      relations: ['recipient'],
      order: { createdAt: 'DESC' },
      take,
      skip,
    })
  }
}
