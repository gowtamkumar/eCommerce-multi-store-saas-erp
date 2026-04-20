import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CampaignMessageEntity } from '../entities/campaign-message.entity'

@Injectable()
export class CampaignMessageRepository {
  constructor(
    @InjectRepository(CampaignMessageEntity)
    private readonly repo: Repository<CampaignMessageEntity>,
  ) {}

  create(data: Partial<CampaignMessageEntity>): CampaignMessageEntity {
    return this.repo.create(data)
  }

  async save(message: CampaignMessageEntity): Promise<CampaignMessageEntity> {
    return this.repo.save(message)
  }

  async findByCampaignId(campaignId: string): Promise<CampaignMessageEntity | null> {
    return this.repo.findOne({ where: { campaignId } })
  }
}
