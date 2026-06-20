import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PlatformCampaignLogEntity } from '../entities/platform-campaign-log.entity'
import { CampaignLogStatus } from '@/modules/admin/marketing/campaign/enums/campaign-log-status.enum'

@Injectable()
export class PlatformCampaignLogRepository {
  constructor(
    @InjectRepository(PlatformCampaignLogEntity)
    private readonly repo: Repository<PlatformCampaignLogEntity>,
  ) {}

  create(data: Partial<PlatformCampaignLogEntity>): PlatformCampaignLogEntity {
    return this.repo.create(data)
  }

  async save(log: PlatformCampaignLogEntity): Promise<PlatformCampaignLogEntity> {
    return this.repo.save(log)
  }

  async claimRecipient(
    platformCampaignId: string,
    recipientKey: string,
    userId: string | null,
    recipientInfo: { name?: string; email?: string; phone?: string },
  ): Promise<{ log: PlatformCampaignLogEntity; created: boolean }> {
    const existing = await this.repo.findOne({
      where: { platformCampaignId, recipientKey },
    })
    if (existing) return { log: existing, created: false }

    try {
      const inserted = await this.repo.save(
        this.repo.create({
          platformCampaignId,
          recipientKey,
          userId: userId ?? undefined,
          status: CampaignLogStatus.PENDING,
          recipientName: recipientInfo.name || null,
          recipientEmail: recipientInfo.email || null,
          recipientPhone: recipientInfo.phone || null,
        } as Partial<PlatformCampaignLogEntity>),
      )
      return { log: inserted, created: true }
    } catch (e: any) {
      if (e?.code === '23505') {
        const fallback = await this.repo.findOne({
          where: { platformCampaignId, recipientKey },
        })
        if (fallback) return { log: fallback, created: false }
      }
      throw e
    }
  }

  async findLogsByCampaign(
    platformCampaignId: string,
    skip: number,
    take: number,
  ): Promise<[PlatformCampaignLogEntity[], number]> {
    return this.repo.findAndCount({
      where: { platformCampaignId },
      relations: {
        recipient: true,
      },
      order: { createdAt: 'DESC' },
      take,
      skip,
    })
  }

  async markOpened(platformCampaignId: string, recipientKey: string): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(PlatformCampaignLogEntity)
      .set({ openedAt: () => 'COALESCE(opened_at, NOW())', status: CampaignLogStatus.OPENED })
      .where('platform_campaign_id = :platformCampaignId AND recipient_key = :recipientKey', {
        platformCampaignId,
        recipientKey,
      })
      .andWhere('status IN (:...allowed)', {
        allowed: [CampaignLogStatus.SENT, CampaignLogStatus.OPENED],
      })
      .execute()
    return (result.affected ?? 0) > 0
  }

  async markClicked(platformCampaignId: string, recipientKey: string): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(PlatformCampaignLogEntity)
      .set({
        clickedAt: () => 'COALESCE(clicked_at, NOW())',
        openedAt: () => 'COALESCE(opened_at, NOW())',
        status: CampaignLogStatus.CLICKED,
      })
      .where('platform_campaign_id = :platformCampaignId AND recipient_key = :recipientKey', {
        platformCampaignId,
        recipientKey,
      })
      .execute()
    return (result.affected ?? 0) > 0
  }

  async getEngagementCounts(platformCampaignId: string): Promise<{ opened: number; clicked: number }> {
    const row = await this.repo
      .createQueryBuilder('log')
      .select('COUNT(*) FILTER (WHERE log.opened_at IS NOT NULL)', 'opened')
      .addSelect('COUNT(*) FILTER (WHERE log.clicked_at IS NOT NULL)', 'clicked')
      .where('log.platform_campaign_id = :platformCampaignId', { platformCampaignId })
      .getRawOne<{ opened: string; clicked: string }>()
    return { opened: Number(row?.opened ?? 0), clicked: Number(row?.clicked ?? 0) }
  }
}
