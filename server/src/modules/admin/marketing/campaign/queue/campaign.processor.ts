import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq'
import { Job, Queue } from 'bullmq'
import { Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CampaignEntity } from '../entities/campaign.entity'
import { CampaignLogEntity } from '../entities/campaign-log.entity'
import { CampaignMessageEntity } from '../entities/campaign-message.entity'
import { CampaignStatus } from '../enums/campaign-status.enum'
import { CampaignType } from '../enums/campaign-type.enum'
import { CampaignLogStatus } from '../enums/campaign-log-status.enum'
import { AudienceService } from '../services/audience.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { SmsService } from '@/modules/admin/operations/infra/sms/sms.service'
import { PushService } from '@/modules/admin/operations/infra/push/push.service'

@Processor('campaign')
export class CampaignProcessor extends WorkerHost {
  private readonly logger = new Logger(CampaignProcessor.name)

  constructor(
    @InjectRepository(CampaignEntity)
    private campaignRepository: Repository<CampaignEntity>,
    @InjectRepository(CampaignMessageEntity)
    private messageRepository: Repository<CampaignMessageEntity>,
    @InjectRepository(CampaignLogEntity)
    private logRepository: Repository<CampaignLogEntity>,
    private audienceService: AudienceService,
    private mailService: MailService,
    private smsService: SmsService,
    private pushService: PushService,
    @InjectQueue('campaign') private readonly campaignQueue: Queue,
  ) {
    super()
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} (Type: ${job.name})`)

    switch (job.name) {
      case 'start-campaign':
        return this.handleStartCampaign(job.data)
      case 'send-message':
        return this.handleSendMessage(job.data)
      default:
        this.logger.warn(`Unknown job name: ${job.name}`)
    }
  }

  private async handleStartCampaign(data: { campaignId: string; tenantId: string }) {
    const { campaignId, tenantId } = data
    const campaign = await this.campaignRepository.findOne({ where: { id: campaignId } })
    if (!campaign) return

    this.logger.log(`Starting campaign: ${campaign.name} (${campaignId})`)

    campaign.status = CampaignStatus.RUNNING
    await this.campaignRepository.save(campaign)

    const audience = await this.audienceService.getAudience(tenantId, {
      targetUsers: campaign.targetUsers,
      targetSubscribers: campaign.targetSubscribers,
      targetLeads: campaign.targetLeads,
    })
    campaign.totalAudience = audience.length
    await this.campaignRepository.save(campaign)

    for (const member of audience) {
      await this.campaignQueue.add('send-message', {
        campaignId,
        userId: member.source === 'user' ? member.id : null,
        tenantId,
        recipient: {
          email: member.email,
          phone: member.phone,
          pushToken: member.pushToken,
          fcmToken: member.fcmToken,
          name: member.name,
        },
      })
    }

    this.logger.log(`Queued ${audience.length} messages for campaign ${campaignId}`)
  }

  private async handleSendMessage(data: {
    campaignId: string
    userId: string
    tenantId: string
    recipient: any
  }) {
    const { campaignId, userId, tenantId, recipient } = data

    // Fetch campaign and its message
    const campaign = await this.campaignRepository.findOne({ where: { id: campaignId } })
    const message = await this.messageRepository.findOne({ where: { campaignId } })

    if (!campaign || !message) return

    // Create log entry as PENDING
    const log = this.logRepository.create({
      campaignId,
      userId,
      status: CampaignLogStatus.PENDING,
    })
    await this.logRepository.save(log)

    try {
      let success = false
      let resultMessage = ''

      if (campaign.type === CampaignType.EMAIL && recipient.email) {
        await this.mailService.sendGenericEmail({
          to: recipient.email,
          subject: message.subject,
          html: message.htmlContent,
          tenantId,
        })
        success = true
      } else if (campaign.type === CampaignType.SMS && recipient.phone) {
        const res = await this.smsService.sendSms(recipient.phone, message.text, tenantId)
        success = res.success
      } else if (campaign.type === CampaignType.PUSH) {
        try {
          await this.pushService.sendToUser(
            userId,
            { title: message.title, body: message.body, imageUrl: message.imageUrl },
            tenantId,
          )
          success = true
        } catch (e) {
          success = false
        }
      }

      if (success) {
        log.status = CampaignLogStatus.SENT
        log.sentAt = new Date()
        campaign.sentCount++
      } else {
        log.status = CampaignLogStatus.FAILED
        log.error = 'Channel delivery failed or missing recipient info'
        campaign.failedCount++
      }
    } catch (error) {
      this.logger.error(
        `Failed to send message to user ${userId} for campaign ${campaignId}`,
        error,
      )
      log.status = CampaignLogStatus.FAILED
      log.error = error.message
      campaign.failedCount++
    }

    await this.logRepository.save(log)
    await this.campaignRepository.save(campaign)

    // Check if campaign is completed
    if (campaign.sentCount + campaign.failedCount >= campaign.totalAudience) {
      campaign.status = CampaignStatus.COMPLETED
      await this.campaignRepository.save(campaign)
    }
  }
}
