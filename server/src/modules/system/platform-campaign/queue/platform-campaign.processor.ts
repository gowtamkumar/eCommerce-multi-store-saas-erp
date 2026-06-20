import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { SmsService } from '@/modules/admin/operations/infra/sms/sms.service'
import { PushService } from '@/modules/admin/operations/infra/push/push.service'
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job, Queue } from 'bullmq'
import { createHash } from 'crypto'
import { CampaignLogStatus } from '@/modules/admin/marketing/campaign/enums/campaign-log-status.enum'
import { CampaignStatus } from '@/modules/admin/marketing/campaign/enums/campaign-status.enum'
import { CampaignType } from '@/modules/admin/marketing/campaign/enums/campaign-type.enum'
import { PlatformCampaignRepository } from '../repositories/platform-campaign.repository'
import { PlatformCampaignMessageRepository } from '../repositories/platform-campaign-message.repository'
import { PlatformCampaignLogRepository } from '../repositories/platform-campaign-log.repository'
import { PlatformAudienceService } from '../services/platform-audience.service'
import { AudienceMember } from '@/modules/admin/marketing/campaign/services/audience.service'

@Processor('platform-campaign')
export class PlatformCampaignProcessor extends WorkerHost {
  private readonly logger = new Logger(PlatformCampaignProcessor.name)

  constructor(
    private readonly campaignRepository: PlatformCampaignRepository,
    private readonly messageRepository: PlatformCampaignMessageRepository,
    private readonly logRepository: PlatformCampaignLogRepository,
    private readonly audienceService: PlatformAudienceService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushService,
    @InjectQueue('platform-campaign')
    private readonly campaignQueue: Queue,
  ) {
    super()
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing platform campaign job ${job.id} (Type: ${job.name})`)

    switch (job.name) {
      case 'start-campaign':
        return this.handleStartCampaign(job.data)
      case 'send-message':
        return this.handleSendMessage(job.data)
      default:
        this.logger.warn(`Unknown platform campaign job name: ${job.name}`)
    }
  }

  private async handleStartCampaign(data: { campaignId: string }) {
    const { campaignId } = data
    const campaign = await this.campaignRepository.findByIdRaw(campaignId)
    if (!campaign) return

    const transitioned = await this.campaignRepository.tryTransitionStatus(
      campaignId,
      CampaignStatus.SCHEDULED,
      CampaignStatus.RUNNING,
    )
    if (!transitioned) {
      this.logger.warn(
        `Platform campaign ${campaignId} not in SCHEDULED state (current: ${campaign.status}); skipping dispatch`,
      )
      return
    }

    this.logger.log(`Starting platform campaign: ${campaign.name} (${campaignId})`)

    const audience = await this.audienceService.getAudience({
      targetTenants: campaign.targetTenants,
      targetSubscribers: campaign.targetSubscribers,
      targetUsers: campaign.targetUsers,
      channel: campaign.type,
    })
    await this.campaignRepository.setTotalAudience(campaignId, audience.length)

    for (const member of audience) {
      const recipientKey = this.recipientKeyFor(member, campaign.type)
      if (!recipientKey) continue

      await this.campaignQueue.add(
        'send-message',
        {
          campaignId,
          userId: member.source === 'user' ? member.id : null,
          recipientKey,
          recipient: {
            email: member.email,
            phone: member.phone,
            pushToken: member.pushToken,
            fcmToken: member.fcmToken,
            name: member.name,
          },
        },
        {
          jobId: `send-platform-${campaignId}-${this.hashKey(recipientKey)}`,
          attempts: 3,
          backoff: { type: 'exponential', delay: 60_000 },
          removeOnComplete: 1000,
          removeOnFail: 1000,
        },
      )
    }

    this.logger.log(`Queued ${audience.length} messages for platform campaign ${campaignId}`)
  }

  private recipientKeyFor(m: AudienceMember, type: CampaignType): string | null {
    switch (type) {
      case CampaignType.EMAIL:
        return m.email ? m.email.toLowerCase() : null
      case CampaignType.SMS:
        return m.phone ? m.phone.replace(/\s+/g, '') : null
      case CampaignType.PUSH:
        return m.source === 'user' ? m.id : null
      default:
        return null
    }
  }

  private hashKey(key: string): string {
    return createHash('sha1').update(key).digest('hex').slice(0, 16)
  }

  private async handleSendMessage(data: {
    campaignId: string
    userId: string | null
    recipientKey: string
    recipient: any
  }) {
    const { campaignId, userId, recipientKey, recipient } = data

    if (!recipientKey) {
      this.logger.warn(`send-message missing recipientKey for platform campaign ${campaignId}`)
      return
    }

    const campaign = await this.campaignRepository.findByIdRaw(campaignId)
    const message = await this.messageRepository.findByCampaignId(campaignId)
    if (!campaign || !message) return

    const { log, created } = await this.logRepository.claimRecipient(
      campaignId,
      recipientKey,
      userId,
      { name: recipient.name, email: recipient.email, phone: recipient.phone },
    )

    if (!created) {
      const terminal: CampaignLogStatus[] = [
        CampaignLogStatus.SENT,
        CampaignLogStatus.OPENED,
        CampaignLogStatus.CLICKED,
      ]
      if (terminal.includes(log.status)) {
        this.logger.debug(
          `Skipping duplicate send for platform campaign=${campaignId} recipient=${recipientKey} (already ${log.status})`,
        )
        return
      }
    }

    try {
      let success = false

      if (campaign.type === CampaignType.EMAIL && recipient.email) {
        // Inject tracking pixel
        let html = message.htmlContent || ''
        const apiBaseUrl = process.env.API_URL || 'http://localhost:3900/api/v1'
        const trackingPixel = `<img src="${apiBaseUrl}/super-admin/campaigns/track/open?c=${campaignId}&r=${encodeURIComponent(recipientKey)}" width="1" height="1" style="display:none;" />`
        if (html.includes('</body>')) {
          html = html.replace('</body>', `${trackingPixel}</body>`)
        } else {
          html += trackingPixel
        }

        await this.mailService.sendGenericEmail({
          to: recipient.email,
          subject: message.subject,
          html,
          tenantId: '', // Send from platform SMTP gateway
        })
        success = true
      } else if (campaign.type === CampaignType.SMS && recipient.phone) {
        const res = await this.smsService.sendSms(recipient.phone, message.text, '')
        success = res.success
      } else if (campaign.type === CampaignType.PUSH && userId) {
        try {
          await this.pushService.sendToUser(
            userId,
            { title: message.title, body: message.body, imageUrl: message.imageUrl },
            '',
          )
          success = true
        } catch (e: any) {
          success = false
          log.error = (e as Error)?.message ?? 'push delivery failed'
        }
      }

      if (success) {
        log.status = CampaignLogStatus.SENT
        log.sentAt = new Date()
        log.error = null
        await this.campaignRepository.incrementSentCount(campaignId, 1)
      } else {
        log.status = CampaignLogStatus.FAILED
        log.error = log.error || 'Channel delivery failed or missing recipient info'
        await this.campaignRepository.incrementFailedCount(campaignId, 1)
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to send message to ${recipientKey} for platform campaign ${campaignId}`,
        error as any,
      )
      log.status = CampaignLogStatus.FAILED
      log.error = (error as Error)?.message ?? 'unknown error'
      await this.campaignRepository.incrementFailedCount(campaignId, 1)
    }

    await this.logRepository.save(log)

    const currentCampaign = await this.campaignRepository.findByIdRaw(campaignId)
    if (
      currentCampaign &&
      currentCampaign.totalAudience > 0 &&
      currentCampaign.sentCount + currentCampaign.failedCount >= currentCampaign.totalAudience
    ) {
      await this.campaignRepository.tryTransitionStatus(
        campaignId,
        CampaignStatus.RUNNING,
        CampaignStatus.COMPLETED,
      )
    }
  }
}
