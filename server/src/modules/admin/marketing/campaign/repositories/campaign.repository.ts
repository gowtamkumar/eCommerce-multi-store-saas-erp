import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CampaignEntity } from '../entities/campaign.entity'

@Injectable()
export class CampaignRepository {
  constructor(
    @InjectRepository(CampaignEntity)
    private readonly repo: Repository<CampaignEntity>,
  ) {}

  create(data: Partial<CampaignEntity>): CampaignEntity {
    return this.repo.create(data)
  }

  async save(campaign: CampaignEntity): Promise<CampaignEntity> {
    return this.repo.save(campaign)
  }

  async findAllByTenant(tenantId: string): Promise<CampaignEntity[]> {
    return this.repo.find({
      where: { tenantId },
      relations: ['messages'],
      order: { createdAt: 'DESC' },
    })
  }

  async findById(id: string, tenantId?: string): Promise<CampaignEntity | null> {
    const where: any = { id }
    if (tenantId) where.tenantId = tenantId
    return this.repo.findOne({
      where,
      relations: ['messages'],
    })
  }

  async findByIdRaw(id: string, tenantId?: string): Promise<CampaignEntity | null> {
    const where: any = { id }
    if (tenantId) where.tenantId = tenantId
    return this.repo.findOne({ where })
  }

  async remove(campaign: CampaignEntity): Promise<void> {
    await this.repo.remove(campaign)
  }

  async incrementSentCount(id: string, count: number = 1): Promise<void> {
    await this.repo.increment({ id }, 'sentCount', count)
  }

  async incrementFailedCount(id: string, count: number = 1): Promise<void> {
    await this.repo.increment({ id }, 'failedCount', count)
  }
}
