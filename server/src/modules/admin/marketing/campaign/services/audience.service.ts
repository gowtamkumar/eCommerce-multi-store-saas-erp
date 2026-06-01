import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { SubscriberEntity } from '@/modules/admin/customer/subscriber/entities/subscriber.entity'
import { LeadEntity } from '@/modules/admin/customer/lead/entities/lead.entity'
import { CampaignType } from '../enums/campaign-type.enum'

export interface AudienceOptions {
  targetUsers?: boolean
  targetSubscribers?: boolean
  targetLeads?: boolean
  /**
   * When set, restrict audience to members that can actually be reached on
   * this channel (have an email for EMAIL, a phone for SMS, a userId for
   * PUSH). Avoids queueing thousands of jobs that will all fail with
   * `missing recipient info`.
   */
  channel?: CampaignType
}

export interface AudienceMember {
  id: string
  email: string
  phone?: string
  pushToken?: string
  fcmToken?: string
  name?: string
  source: 'user' | 'subscriber' | 'lead'
}

@Injectable()
export class AudienceService {
  private readonly logger = new Logger(AudienceService.name)

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(SubscriberEntity)
    private subscriberRepository: Repository<SubscriberEntity>,
    @InjectRepository(LeadEntity)
    private leadRepository: Repository<LeadEntity>,
  ) {}

  /**
   * Fetches the audience for a campaign based on targeting options.
   * Deduplicates members by email to prevent double-sending.
   */
  async getAudience(
    tenantId: string,
    options: AudienceOptions = { targetUsers: true },
  ): Promise<AudienceMember[]> {
    this.logger.log(
      `Fetching audience for tenant: ${tenantId} with options: ${JSON.stringify(options)}`,
    )

    const membersMap = new Map<string, AudienceMember>()

    // 1. Fetch Users
    if (options.targetUsers !== false) {
      const users = await this.userRepository.find({
        where: { tenantId, status: 'active' as any },
        select: ['id', 'email', 'phone', 'pushToken', 'fcmToken', 'name'],
      })
      users.forEach((u) => {
        if (u.email) {
          membersMap.set(u.email.toLowerCase(), {
            id: u.id,
            email: u.email,
            phone: u.phone,
            pushToken: u.pushToken,
            fcmToken: u.fcmToken,
            name: u.name,
            source: 'user',
          })
        }
      })
    }

    // 2. Fetch Subscribers
    if (options.targetSubscribers) {
      const subscribers = await this.subscriberRepository.find({
        where: { tenantId, isActive: true },
        select: ['id', 'email'],
      })
      subscribers.forEach((s) => {
        const email = s.email.toLowerCase()
        if (!membersMap.has(email)) {
          membersMap.set(email, {
            id: s.id,
            email: s.email,
            source: 'subscriber',
          })
        }
      })
    }

    // 3. Fetch Leads
    if (options.targetLeads) {
      const leads = await this.leadRepository.find({
        where: { tenantId },
        select: ['id', 'email', 'phone', 'name'],
      })
      leads.forEach((l) => {
        const email = l.email.toLowerCase()
        if (!membersMap.has(email)) {
          membersMap.set(email, {
            id: l.id,
            email: l.email,
            phone: l.phone,
            name: l.name,
            source: 'lead',
          })
        }
      })
    }

    let audience = Array.from(membersMap.values())

    // Channel-aware filtering: drop members who can't be reached on the
    // requested channel before we queue any jobs.
    if (options.channel) {
      const before = audience.length
      audience = audience.filter((m) => this.canReceiveOnChannel(m, options.channel!))
      const dropped = before - audience.length
      if (dropped > 0) {
        this.logger.log(`Filtered ${dropped} members lacking ${options.channel} contact info`)
      }
    }

    this.logger.log(`Total unique audience members found: ${audience.length}`)
    return audience
  }

  private canReceiveOnChannel(m: AudienceMember, channel: CampaignType): boolean {
    switch (channel) {
      case CampaignType.EMAIL:
        return !!m.email
      case CampaignType.SMS:
        return !!m.phone
      case CampaignType.PUSH:
        // PushService.sendToUser needs a userId — only `user`-sourced
        // members have a device token registered in our identity tables.
        return m.source === 'user' && !!(m.pushToken || m.fcmToken)
      default:
        return true
    }
  }
}
