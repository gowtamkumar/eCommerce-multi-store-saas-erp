import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PlatformCampaignEntity } from '../entities/platform-campaign.entity'
import { CampaignStatus } from '@/modules/admin/marketing/campaign/enums/campaign-status.enum'

@Injectable()
export class PlatformCampaignRepository {
  constructor(
    @InjectRepository(PlatformCampaignEntity)
    private readonly repo: Repository<PlatformCampaignEntity>,
  ) {}

  async tryTransitionStatus(
    id: string,
    from: CampaignStatus,
    to: CampaignStatus,
  ): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(PlatformCampaignEntity)
      .set({ status: to })
      .where('id = :id AND status = :from', { id, from })
      .execute()
    return (result.affected ?? 0) > 0
  }

  async setTotalAudience(id: string, total: number): Promise<void> {
    await this.repo.update({ id }, { totalAudience: total })
  }

  create(data: Partial<PlatformCampaignEntity>): PlatformCampaignEntity {
    return this.repo.create(data)
  }

  async save(campaign: PlatformCampaignEntity): Promise<PlatformCampaignEntity> {
    return this.repo.save(campaign)
  }

  async findAll(): Promise<PlatformCampaignEntity[]> {
    return this.repo.find({
      relations: {
        messages: true,
      },
      order: { createdAt: 'DESC' },
    })
  }

  async findById(id: string): Promise<PlatformCampaignEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        messages: true,
      },
    })
  }

  async findByIdRaw(id: string): Promise<PlatformCampaignEntity | null> {
    return this.repo.findOne({ where: { id } })
  }

  async remove(campaign: PlatformCampaignEntity): Promise<void> {
    await this.repo.remove(campaign)
  }

  async incrementSentCount(id: string, count: number = 1): Promise<void> {
    await this.repo.increment({ id }, 'sentCount', count)
  }

  async incrementFailedCount(id: string, count: number = 1): Promise<void> {
    await this.repo.increment({ id }, 'failedCount', count)
  }
}
