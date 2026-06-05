import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CampaignLogEntity } from '../entities/campaign-log.entity'
import { CampaignLogStatus } from '../enums/campaign-log-status.enum'

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

  /**
   * Idempotent log insertion keyed by `(campaign_id, recipient_key)`.
   *
   * Returns the canonical log row — newly inserted, or pre-existing if a
   * prior worker already created one for the same recipient. The caller
   * should skip dispatching when the existing row is in SENT/OPENED/CLICKED
   * status so duplicate jobs do not re-send.
   */
  async claimRecipient(
    campaignId: string,
    recipientKey: string,
    userId: string | null,
    metadata: any,
  ): Promise<{ log: CampaignLogEntity; created: boolean }> {
    const existing = await this.repo.findOne({
      where: { campaignId, recipientKey },
    })
    if (existing) return { log: existing, created: false }

    try {
      const inserted = await this.repo.save(
        this.repo.create({
          campaignId,
          recipientKey,
          userId: userId ?? undefined,
          status: CampaignLogStatus.PENDING,
          metadata,
        } as Partial<CampaignLogEntity>),
      )
      return { log: inserted, created: true }
    } catch (e: any) {
      // Lost a race against another worker — re-read the row.
      if (e?.code === '23505') {
        const fallback = await this.repo.findOne({
          where: { campaignId, recipientKey },
        })
        if (fallback) return { log: fallback, created: false }
      }
      throw e
    }
  }

  async findLogsByCampaign(
    campaignId: string,
    skip: number,
    take: number,
  ): Promise<[CampaignLogEntity[], number]> {
    return this.repo.findAndCount({
      where: { campaignId },
      relations: {
        recipient: true,
      },
      order: { createdAt: 'DESC' },
      take,
      skip,
    })
  }

  /**
   * Update the open/click tracking columns. Returns the updated row count;
   * callers can use this to drive sent/open/click KPIs in the campaign
   * status response.
   */
  async markOpened(campaignId: string, recipientKey: string): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(CampaignLogEntity)
      .set({ openedAt: () => 'COALESCE(opened_at, NOW())', status: CampaignLogStatus.OPENED })
      .where('campaign_id = :campaignId AND recipient_key = :recipientKey', {
        campaignId,
        recipientKey,
      })
      .andWhere('status IN (:...allowed)', {
        allowed: [CampaignLogStatus.SENT, CampaignLogStatus.OPENED],
      })
      .execute()
    return (result.affected ?? 0) > 0
  }

  /**
   * Aggregate opened/clicked counts for a campaign in a single round-trip.
   * Used by the KPI endpoint and admin UI.
   */
  async getEngagementCounts(campaignId: string): Promise<{ opened: number; clicked: number }> {
    const row = await this.repo
      .createQueryBuilder('log')
      .select('COUNT(*) FILTER (WHERE log.opened_at IS NOT NULL)', 'opened')
      .addSelect('COUNT(*) FILTER (WHERE log.clicked_at IS NOT NULL)', 'clicked')
      .where('log.campaign_id = :campaignId', { campaignId })
      .getRawOne<{ opened: string; clicked: string }>()
    return { opened: Number(row?.opened ?? 0), clicked: Number(row?.clicked ?? 0) }
  }

  async markClicked(campaignId: string, recipientKey: string): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(CampaignLogEntity)
      .set({
        clickedAt: () => 'COALESCE(clicked_at, NOW())',
        openedAt: () => 'COALESCE(opened_at, NOW())',
        status: CampaignLogStatus.CLICKED,
      })
      .where('campaign_id = :campaignId AND recipient_key = :recipientKey', {
        campaignId,
        recipientKey,
      })
      .execute()
    return (result.affected ?? 0) > 0
  }
}
