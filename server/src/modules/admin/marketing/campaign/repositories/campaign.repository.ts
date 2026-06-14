import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CampaignEntity } from '../entities/campaign.entity'
import { CampaignStatus } from '../enums/campaign-status.enum'

@Injectable()
export class CampaignRepository {
  constructor(
    @InjectRepository(CampaignEntity)
    private readonly repo: Repository<CampaignEntity>,
  ) {}

  /**
   * Atomic status transition — only flips the row if the current status
   * matches `from`. Prevents two workers from racing into RUNNING and
   * dispatching the audience twice.
   */
  async tryTransitionStatus(
    id: string,
    from: CampaignStatus,
    to: CampaignStatus,
  ): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(CampaignEntity)
      .set({ status: to })
      .where('id = :id AND status = :from', { id, from })
      .execute()
    return (result.affected ?? 0) > 0
  }

  async setTotalAudience(id: string, total: number): Promise<void> {
    await this.repo.update({ id }, { totalAudience: total })
  }

  create(data: Partial<CampaignEntity>): CampaignEntity {
    return this.repo.create(data)
  }

  async save(campaign: CampaignEntity): Promise<CampaignEntity> {
    return this.repo.save(campaign)
  }

  async findAllByTenant(tenantId: string): Promise<CampaignEntity[]> {
    return this.repo.find({
      where: { tenantId },
      relations: {
        messages: true,
      },
      order: { createdAt: 'DESC' },
    })
  }

  async findById(id: string, tenantId?: string): Promise<CampaignEntity | null> {
    const where: any = { id }
    if (tenantId) where.tenantId = tenantId
    return this.repo.findOne({
      where,
      relations: {
        messages: true,
      },
    })
  }

  async findByIdRaw(id: string, tenantId?: string): Promise<CampaignEntity | null> {
    const where: any = { id }
    if (tenantId) where.tenantId = tenantId
    return this.repo.findOne({ where })
  }

  async remove(campaign: CampaignEntity): Promise<void> {
    await this.repo.softRemove(campaign)
  }

  async incrementSentCount(id: string, count: number = 1): Promise<void> {
    await this.repo.increment({ id }, 'sentCount', count)
  }

  async incrementFailedCount(id: string, count: number = 1): Promise<void> {
    await this.repo.increment({ id }, 'failedCount', count)
  }
}
