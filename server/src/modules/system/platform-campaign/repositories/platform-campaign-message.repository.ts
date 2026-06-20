import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PlatformCampaignMessageEntity } from '../entities/platform-campaign-message.entity'

@Injectable()
export class PlatformCampaignMessageRepository {
  constructor(
    @InjectRepository(PlatformCampaignMessageEntity)
    private readonly repo: Repository<PlatformCampaignMessageEntity>,
  ) {}

  create(data: Partial<PlatformCampaignMessageEntity>): PlatformCampaignMessageEntity {
    return this.repo.create(data)
  }

  async save(message: PlatformCampaignMessageEntity): Promise<PlatformCampaignMessageEntity> {
    return this.repo.save(message)
  }

  async findByCampaignId(platformCampaignId: string): Promise<PlatformCampaignMessageEntity | null> {
    return this.repo.findOne({ where: { platformCampaignId } })
  }
}
