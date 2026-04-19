import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CampaignEntity } from '../entities/campaign.entity'
import { CampaignMessageEntity } from '../entities/campaign-message.entity'
import { CampaignStatus } from '../enums/campaign-status.enum'
import { CreateCampaignDto } from '../dto/create-campaign.dto'
import { ScheduleCampaignDto } from '../dto/schedule-campaign.dto'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name)

  constructor(
    @InjectRepository(CampaignEntity)
    private campaignRepository: Repository<CampaignEntity>,
    @InjectRepository(CampaignMessageEntity)
    private messageRepository: Repository<CampaignMessageEntity>,
    @InjectQueue('campaign')
    private campaignQueue: Queue,
  ) {}

  async createCampaign(dto: CreateCampaignDto, ctx: RequestContextDto): Promise<CampaignEntity> {
    const tenantId = ctx.tenantId
    this.logger.log(`Creating campaign for tenant: ${tenantId}`)

    const campaign = this.campaignRepository.create({
      name: dto.name,
      type: dto.type,
      tenantId,
      status: CampaignStatus.DRAFT,
      scheduleTime: dto.scheduleTime ? new Date(dto.scheduleTime) : null,
      user: { id: ctx.user?.id } as any,
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
    return this.campaignRepository.find({
      where: { tenantId: ctx.tenantId },
      order: { createdAt: 'DESC' },
    })
  }

  async findOne(id: string, ctx: RequestContextDto): Promise<CampaignEntity> {
    const campaign = await this.campaignRepository.findOne({
      where: { id, tenantId: ctx.tenantId },
      relations: ['messages'],
    })

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
}
