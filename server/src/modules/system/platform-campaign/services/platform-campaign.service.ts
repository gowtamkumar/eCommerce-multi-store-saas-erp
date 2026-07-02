import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { PlatformCampaignRepository } from '../repositories/platform-campaign.repository'
import { PlatformCampaignMessageRepository } from '../repositories/platform-campaign-message.repository'
import { PlatformCampaignLogRepository } from '../repositories/platform-campaign-log.repository'
import { PlatformCampaignEntity } from '../entities/platform-campaign.entity'
import { PlatformCampaignLogEntity } from '../entities/platform-campaign-log.entity'
import { CampaignStatus } from '@/modules/admin/marketing/campaign/enums/campaign-status.enum'

@Injectable()
export class PlatformCampaignService {
  private readonly logger = new Logger(PlatformCampaignService.name)

  constructor(
    private readonly campaignRepository: PlatformCampaignRepository,
    private readonly messageRepository: PlatformCampaignMessageRepository,
    private readonly logRepository: PlatformCampaignLogRepository,
    @InjectQueue('platform-campaign')
    private readonly campaignQueue: Queue,
  ) {}

  async createCampaign(dto: any, userId: string | null): Promise<PlatformCampaignEntity> {
    this.logger.log(`Creating platform campaign: ${dto.name}`)

    const campaign = this.campaignRepository.create({
      name: dto.name,
      type: dto.type,
      status: CampaignStatus.DRAFT,
      scheduleTime: dto.scheduleTime ? new Date(dto.scheduleTime) : null,
      userId,
      targetStores: dto.targetStores ?? false,
      targetSubscribers: dto.targetSubscribers ?? false,
      targetUsers: dto.targetUsers ?? false,
    })

    const savedCampaign = await this.campaignRepository.save(campaign)

    const message = this.messageRepository.create({
      platformCampaignId: savedCampaign.id,
      subject: dto.subject,
      htmlContent: dto.htmlContent,
      text: dto.text,
      title: dto.title,
      body: dto.body,
      imageUrl: dto.imageUrl,
    })

    await this.messageRepository.save(message)

    return savedCampaign
  }

  async findAll(): Promise<PlatformCampaignEntity[]> {
    return this.campaignRepository.findAll()
  }

  async findOne(id: string): Promise<PlatformCampaignEntity> {
    const campaign = await this.campaignRepository.findById(id)
    if (!campaign) throw new NotFoundException('Platform campaign not found')
    return campaign
  }

  async scheduleCampaign(id: string, dto: { scheduleTime: string }): Promise<PlatformCampaignEntity> {
    const campaign = await this.findOne(id)

    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Only draft campaigns can be scheduled')
    }

    const scheduleTime = new Date(dto.scheduleTime)
    const delay = scheduleTime.getTime() - Date.now()

    if (delay < 0) {
      throw new BadRequestException('Schedule time must be in the future')
    }

    campaign.status = CampaignStatus.SCHEDULED
    campaign.scheduleTime = scheduleTime
    const saved = await this.campaignRepository.save(campaign)

    // Add job to BullMQ
    await this.campaignQueue.add(
      'start-campaign',
      { campaignId: campaign.id },
      { delay, jobId: `start-platform-${campaign.id}` },
    )

    this.logger.log(`Platform campaign ${id} scheduled for ${scheduleTime}`)
    return saved
  }

  async cancelSchedule(id: string): Promise<PlatformCampaignEntity> {
    const campaign = await this.findOne(id)

    if (campaign.status !== CampaignStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled campaigns can be canceled')
    }

    const job = await this.campaignQueue.getJob(`start-platform-${campaign.id}`)
    if (job) {
      await job.remove()
    }

    campaign.status = CampaignStatus.DRAFT
    return this.campaignRepository.save(campaign)
  }

  async updateCampaign(id: string, dto: any): Promise<PlatformCampaignEntity> {
    const campaign = await this.findOne(id)

    if (campaign.status !== CampaignStatus.DRAFT && campaign.status !== CampaignStatus.SCHEDULED) {
      throw new BadRequestException('Only draft or scheduled campaigns can be updated')
    }

    if (dto.name) campaign.name = dto.name
    if (dto.type) campaign.type = dto.type
    if (dto.scheduleTime) campaign.scheduleTime = new Date(dto.scheduleTime)
    if (dto.targetStores !== undefined) campaign.targetStores = dto.targetStores
    if (dto.targetSubscribers !== undefined) campaign.targetSubscribers = dto.targetSubscribers
    if (dto.targetUsers !== undefined) campaign.targetUsers = dto.targetUsers

    const savedCampaign = await this.campaignRepository.save(campaign)

    const message = await this.messageRepository.findByCampaignId(id)
    if (message) {
      if (dto.subject) message.subject = dto.subject
      if (dto.htmlContent) message.htmlContent = dto.htmlContent
      if (dto.text) message.text = dto.text
      if (dto.title) message.title = dto.title
      if (dto.body) message.body = dto.body
      if (dto.imageUrl) message.imageUrl = dto.imageUrl
      await this.messageRepository.save(message)
    }

    if (campaign.status === CampaignStatus.SCHEDULED && dto.scheduleTime) {
      const oldJob = await this.campaignQueue.getJob(`start-platform-${campaign.id}`)
      if (oldJob) await oldJob.remove()

      const delay = new Date(dto.scheduleTime).getTime() - Date.now()
      if (delay > 0) {
        await this.campaignQueue.add(
          'start-campaign',
          { campaignId: campaign.id },
          { delay, jobId: `start-platform-${campaign.id}` },
        )
      }
    }

    return savedCampaign
  }

  async deleteCampaign(id: string): Promise<void> {
    const campaign = await this.findOne(id)

    if (campaign.status === CampaignStatus.RUNNING) {
      throw new BadRequestException('Cannot delete a running campaign')
    }

    if (campaign.status === CampaignStatus.SCHEDULED) {
      const job = await this.campaignQueue.getJob(`start-platform-${campaign.id}`)
      if (job) await job.remove()
    }

    await this.campaignRepository.remove(campaign)
  }

  async getLogs(
    id: string,
    page: number,
    limit: number,
  ): Promise<{ data: PlatformCampaignLogEntity[]; total: number; page: number; limit: number }> {
    await this.findOne(id)
    const skip = (page - 1) * limit
    const [data, total] = await this.logRepository.findLogsByCampaign(id, skip, limit)
    return { data, total, page, limit }
  }

  async getKpis(id: string): Promise<any> {
    const campaign = await this.findOne(id)
    const { opened, clicked } = await this.logRepository.getEngagementCounts(id)
    const sent = campaign.sentCount ?? 0
    const failed = campaign.failedCount ?? 0
    const audience = campaign.totalAudience ?? 0
    const rate = (num: number, den: number) =>
      den > 0 ? Number(((num / den) * 100).toFixed(2)) : 0
    return {
      campaignId: id,
      totalAudience: audience,
      sent,
      failed,
      opened,
      clicked,
      deliveryRate: rate(sent, audience),
      openRate: rate(opened, sent),
      clickRate: rate(clicked, sent),
    }
  }

  async recordOpen(campaignId: string, recipientKey: string): Promise<void> {
    await this.logRepository.markOpened(campaignId, recipientKey)
  }

  async recordClick(campaignId: string, recipientKey: string): Promise<void> {
    await this.logRepository.markClicked(campaignId, recipientKey)
  }
}
