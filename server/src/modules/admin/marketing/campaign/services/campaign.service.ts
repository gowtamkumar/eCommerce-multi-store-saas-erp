import { RequestContextDto } from '@/common/dto/request-context.dto'
import { InjectQueue } from '@nestjs/bullmq'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Queue } from 'bullmq'
import { CreateCampaignDto } from '../dto/create-campaign.dto'
import { ScheduleCampaignDto } from '../dto/schedule-campaign.dto'
import { CampaignLogEntity } from '../entities/campaign-log.entity'
import { CampaignEntity } from '../entities/campaign.entity'
import { CampaignStatus } from '../enums/campaign-status.enum'
import { CampaignLogRepository } from '../repositories/campaign-log.repository'
import { CampaignMessageRepository } from '../repositories/campaign-message.repository'
import { CampaignRepository } from '../repositories/campaign.repository'

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name)

  constructor(
    private campaignRepository: CampaignRepository,
    private messageRepository: CampaignMessageRepository,
    private logRepository: CampaignLogRepository,
    @InjectQueue('campaign')
    private campaignQueue: Queue,
  ) {}

  async createCampaign(dto: CreateCampaignDto, ctx: RequestContextDto): Promise<CampaignEntity> {
    const tenantId = ctx.tenantId
    const userId = ctx.userId
    this.logger.log(`Creating campaign for tenant: ${tenantId}`)

    const campaign = this.campaignRepository.create({
      name: dto.name,
      type: dto.type,
      tenantId,
      status: CampaignStatus.DRAFT,
      scheduleTime: dto.scheduleTime ? new Date(dto.scheduleTime) : null,
      user: { id: userId } as any,
      targetUsers: dto.targetUsers ?? true,
      targetSubscribers: dto.targetSubscribers ?? false,
      targetLeads: dto.targetLeads ?? false,
    })

    const savedCampaign = await this.campaignRepository.save(campaign)

    // Save initial message content if provided
    const message = this.messageRepository.create({
      campaignId: savedCampaign.id,
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

  async findAll(ctx: RequestContextDto): Promise<CampaignEntity[]> {
    return this.campaignRepository.findAllByTenant(ctx.tenantId)
  }

  async findOne(id: string, ctx: RequestContextDto): Promise<CampaignEntity> {
    const campaign = await this.campaignRepository.findById(id, ctx.tenantId)

    if (!campaign) throw new NotFoundException('Campaign not found')
    return campaign
  }

  async scheduleCampaign(
    id: string,
    dto: ScheduleCampaignDto,
    ctx: RequestContextDto,
  ): Promise<CampaignEntity> {
    const campaign = await this.findOne(id, ctx)

    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Only draft campaigns can be scheduled')
    }
    console.log('dto', dto)

    const scheduleTime = new Date(dto.scheduleTime)
    const delay = scheduleTime.getTime() - Date.now()

    if (delay < 0) {
      throw new BadRequestException('Schedule time must be in the future')
    }

    campaign.status = CampaignStatus.SCHEDULED
    campaign.scheduleTime = scheduleTime
    const saved = await this.campaignRepository.save(campaign)

    // Add delayed job to BullMQ
    await this.campaignQueue.add(
      'start-campaign',
      { campaignId: campaign.id, tenantId: ctx.tenantId },
      { delay, jobId: `start-${campaign.id}` }, // Unique ID to prevent double scheduling
    )

    this.logger.log(`Campaign ${id} scheduled for ${scheduleTime}`)
    return saved
  }

  async cancelSchedule(id: string, ctx: RequestContextDto): Promise<CampaignEntity> {
    const campaign = await this.findOne(id, ctx)

    if (campaign.status !== CampaignStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled campaigns can be canceled')
    }

    // Remove job from BullMQ
    const job = await this.campaignQueue.getJob(`start-${campaign.id}`)
    if (job) {
      await job.remove()
    }

    campaign.status = CampaignStatus.DRAFT
    return this.campaignRepository.save(campaign)
  }

  async updateCampaign(
    id: string,
    dto: any, // Using any here to support the partial fields from UpdateCampaignDto
    ctx: RequestContextDto,
  ): Promise<CampaignEntity> {
    const campaign = await this.findOne(id, ctx)

    if (campaign.status !== CampaignStatus.DRAFT && campaign.status !== CampaignStatus.SCHEDULED) {
      throw new BadRequestException('Only draft or scheduled campaigns can be updated')
    }

    // Update Campaign metadata
    if (dto.name) campaign.name = dto.name
    if (dto.type) campaign.type = dto.type
    if (dto.scheduleTime) campaign.scheduleTime = new Date(dto.scheduleTime)
    if (dto.targetUsers !== undefined) campaign.targetUsers = dto.targetUsers
    if (dto.targetSubscribers !== undefined) campaign.targetSubscribers = dto.targetSubscribers
    if (dto.targetLeads !== undefined) campaign.targetLeads = dto.targetLeads

    const savedCampaign = await this.campaignRepository.save(campaign)

    // Update Campaign Message
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

    // If it was scheduled, we might need to re-schedule or just keep it.
    if (campaign.status === CampaignStatus.SCHEDULED && dto.scheduleTime) {
      // Remove old job first
      const oldJob = await this.campaignQueue.getJob(`start-${campaign.id}`)
      if (oldJob) await oldJob.remove()

      // Re-add to queue with new delay
      const delay = new Date(dto.scheduleTime).getTime() - Date.now()
      if (delay > 0) {
        await this.campaignQueue.add(
          'start-campaign',
          { campaignId: campaign.id, tenantId: ctx.tenantId },
          { delay, jobId: `start-${campaign.id}` },
        )
      }
    }

    return savedCampaign
  }

  async deleteCampaign(id: string, ctx: RequestContextDto): Promise<void> {
    const campaign = await this.findOne(id, ctx)

    if (campaign.status === CampaignStatus.RUNNING) {
      throw new BadRequestException('Cannot delete a running campaign')
    }

    // Cancel job if scheduled
    if (campaign.status === CampaignStatus.SCHEDULED) {
      const job = await this.campaignQueue.getJob(`start-${campaign.id}`)
      if (job) await job.remove()
    }

    await this.campaignRepository.remove(campaign)
  }

  async getLogs(
    id: string,
    page: number,
    limit: number,
    ctx: RequestContextDto,
  ): Promise<{ data: CampaignLogEntity[]; total: number; page: number; limit: number }> {
    // Verify campaign belongs to tenant
    await this.findOne(id, ctx)

    const skip = (page - 1) * limit

    const [data, total] = await this.logRepository.findLogsByCampaign(id, skip, limit)

    return { data, total, page, limit }
  }
}
