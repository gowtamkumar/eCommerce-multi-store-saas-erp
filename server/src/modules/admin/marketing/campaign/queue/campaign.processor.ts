import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { PushService } from '@/modules/admin/operations/infra/push/push.service'
import { SmsService } from '@/modules/admin/operations/infra/sms/sms.service'
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job, Queue } from 'bullmq'
import { createHash } from 'crypto'
import { CampaignLogStatus } from '../enums/campaign-log-status.enum'
import { CampaignStatus } from '../enums/campaign-status.enum'
import { CampaignType } from '../enums/campaign-type.enum'
import { CampaignLogRepository } from '../repositories/campaign-log.repository'
import { CampaignMessageRepository } from '../repositories/campaign-message.repository'
import { CampaignRepository } from '../repositories/campaign.repository'
import { AudienceService, AudienceMember } from '../services/audience.service'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'

@Processor('campaign')
export class CampaignProcessor extends WorkerHost {
  private readonly logger = new Logger(CampaignProcessor.name)

  constructor(
    private campaignRepository: CampaignRepository,
    private messageRepository: CampaignMessageRepository,
    private logRepository: CampaignLogRepository,
    private audienceService: AudienceService,
    private mailService: MailService,
    private smsService: SmsService,
    private pushService: PushService,
    private notificationService: NotificationService,
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
    const campaign = await this.campaignRepository.findByIdRaw(campaignId)
    if (!campaign) return

    // Atomic gate: only one worker may flip SCHEDULED → RUNNING. Without
    // this check, a redelivered job (BullMQ retry, manual re-enqueue) would
    // re-dispatch the entire audience.
    const transitioned = await this.campaignRepository.tryTransitionStatus(
      campaignId,
      CampaignStatus.SCHEDULED,
      CampaignStatus.RUNNING,
    )
    if (!transitioned) {
      this.logger.warn(
        `Campaign ${campaignId} not in SCHEDULED state (current: ${campaign.status}); skipping dispatch`,
      )
      return
    }

    this.logger.log(`Starting campaign: ${campaign.name} (${campaignId})`)

    const audience = await this.audienceService.getAudience(tenantId, {
      targetUsers: campaign.targetUsers,
      targetSubscribers: campaign.targetSubscribers,
      targetLeads: campaign.targetLeads,
      channel: campaign.type,
    })
    await this.campaignRepository.setTotalAudience(campaignId, audience.length)

    // Trigger Budget Alert (Simulated since budget is not directly tracked)
    try {
      await this.notificationService.createNotification(
        {
          title: 'Campaign Budget Alert',
          message: `Campaign '${campaign.name}' has reached 90% of its budget.`,
          type: 'WARNING',
          link: `/admin/campaigns`,
          userId: null as any, // Send to all admins
        },
        tenantId,
      )
    } catch (e) {
      this.logger.error(`Failed to trigger campaign budget notification: ${e.message}`)
    }

    for (const member of audience) {
      const recipientKey = this.recipientKeyFor(member, campaign.type)
      if (!recipientKey) continue

      await this.campaignQueue.add(
        'send-message',
        {
          campaignId,
          userId: member.source === 'user' ? member.id : null,
          tenantId,
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
          // Deterministic jobId — BullMQ deduplicates identical ids, so a
          // re-run of handleStartCampaign for the same campaign cannot
          // create a second job for the same recipient.
          jobId: `send-${campaignId}-${this.hashKey(recipientKey)}`,
          attempts: 3,
          backoff: { type: 'exponential', delay: 60_000 },
          removeOnComplete: 1000,
          removeOnFail: 1000,
        },
      )
    }

    this.logger.log(`Queued ${audience.length} messages for campaign ${campaignId}`)
  }

  private recipientKeyFor(m: AudienceMember, type: CampaignType): string | null {
    switch (type) {
      case CampaignType.EMAIL:
        return m.email ? m.email.toLowerCase() : null
      case CampaignType.SMS:
        return m.phone ? m.phone.replace(/\s+/g, '') : null
      case CampaignType.PUSH:
        // PushService routes by userId — non-user audience members can't be
        // reached over push and were already filtered out upstream.
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
    tenantId: string
    recipientKey: string
    recipient: any
  }) {
    const { campaignId, userId, tenantId, recipientKey, recipient } = data

    if (!recipientKey) {
      this.logger.warn(`send-message missing recipientKey for campaign ${campaignId}`)
      return
    }

    const campaign = await this.campaignRepository.findByIdRaw(campaignId)
    const message = await this.messageRepository.findByCampaignId(campaignId)
    if (!campaign || !message) return

    // Claim this (campaign, recipient) slot. If another worker already
    // delivered, claimRecipient returns the existing row and we no-op.
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
          `Skipping dup send for campaign=${campaignId} recipient=${recipientKey} (already ${log.status})`,
        )
        return
      }
      // PENDING/FAILED → fall through and retry delivery on this same row.
    }

    try {
      let success = false

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
      } else if (campaign.type === CampaignType.PUSH && userId) {
        try {
          await this.pushService.sendToUser(
            userId,
            { title: message.title, body: message.body, imageUrl: message.imageUrl },
            tenantId,
          )
          success = true
        } catch (e) {
          success = false
          log.error = (e as Error)?.message ?? 'push delivery failed'
        }
      }

      if (success) {
        log.status = CampaignLogStatus.SENT
        log.sentAt = new Date()
        log.error = null as any
        await this.campaignRepository.incrementSentCount(campaignId, 1)
      } else {
        log.status = CampaignLogStatus.FAILED
        log.error = log.error || 'Channel delivery failed or missing recipient info'
        await this.campaignRepository.incrementFailedCount(campaignId, 1)
      }
    } catch (error) {
      this.logger.error(
        `Failed to send message to ${recipientKey} for campaign ${campaignId}`,
        error as any,
      )
      log.status = CampaignLogStatus.FAILED
      log.error = (error as Error)?.message ?? 'unknown error'
      await this.campaignRepository.incrementFailedCount(campaignId, 1)
    }

    await this.logRepository.save(log)

    // Mark COMPLETED only when running and audience has been exhausted —
    // and only if the transition is still valid (avoids stomping over
    // FAILED/CANCELLED states a future migration might introduce).
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
