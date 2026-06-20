import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { SubscriberEntity } from '@/modules/admin/customer/subscriber/entities/subscriber.entity'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { CampaignType } from '@/modules/admin/marketing/campaign/enums/campaign-type.enum'
import { AudienceMember } from '@/modules/admin/marketing/campaign/services/audience.service'

@Injectable()
export class PlatformAudienceService {
  private readonly logger = new Logger(PlatformAudienceService.name)

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(SubscriberEntity)
    private readonly subscriberRepository: Repository<SubscriberEntity>,
  ) {}

  async getAudience(options: {
    targetTenants?: boolean
    targetSubscribers?: boolean
    targetUsers?: boolean
    channel?: CampaignType
  }): Promise<AudienceMember[]> {
    this.logger.log(`Fetching platform campaign audience with options: ${JSON.stringify(options)}`)
    const membersMap = new Map<string, AudienceMember>()

    // 1. Fetch Registered Store Admins (Tenant owners/managers)
    if (options.targetTenants) {
      const tenantAdmins = await this.userRepository.find({
        where: { role: UserRole.ADMIN, status: 'active' as any },
        select: { id: true, email: true, phone: true, name: true, pushToken: true, fcmToken: true },
      })
      tenantAdmins.forEach((u) => {
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

    // 2. Fetch Global Subscribers (landing page subscribers where tenantId is null)
    if (options.targetSubscribers) {
      const subscribers = await this.subscriberRepository.find({
        where: { tenantId: IsNull(), isActive: true },
        select: { id: true, email: true },
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

    // 3. Fetch All System Users (excluding Super Admins)
    if (options.targetUsers) {
      const allUsers = await this.userRepository.find({
        where: { status: 'active' as any },
        select: { id: true, email: true, phone: true, name: true, role: true, pushToken: true, fcmToken: true },
      })
      allUsers.forEach((u) => {
        if (u.email && u.role !== UserRole.SUPER_ADMIN) {
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

    let audience = Array.from(membersMap.values())

    // Channel Filtering
    if (options.channel) {
      audience = audience.filter((m) => {
        if (options.channel === CampaignType.EMAIL) return !!m.email
        if (options.channel === CampaignType.SMS) return !!m.phone
        if (options.channel === CampaignType.PUSH) return m.source === 'user' && !!(m.pushToken || m.fcmToken)
        return true
      })
    }

    this.logger.log(`Total unique platform audience members found: ${audience.length}`)
    return audience
  }
}
