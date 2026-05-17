import { Injectable, Logger } from '@nestjs/common'
import * as webPush from 'web-push'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DeviceEntity } from './entities/device.entity'
import { RegisterDeviceDto, UnregisterDeviceDto } from './dto/device.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name)
  private readonly vapidSubject: string
  private readonly vapidPublicKey: string
  private readonly vapidPrivateKey: string
  private isConfigured: boolean = false

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
  ) {
    this.vapidSubject =
      this.configService.get<string>('VAPID_SUBJECT') || 'mailto:admin@example.com'
    this.vapidPublicKey = this.configService.get<string>('VAPID_PUBLIC_KEY') || ''
    this.vapidPrivateKey = this.configService.get<string>('VAPID_PRIVATE_KEY') || ''

    if (this.vapidPublicKey && this.vapidPrivateKey) {
      webPush.setVapidDetails(this.vapidSubject, this.vapidPublicKey, this.vapidPrivateKey)
      this.isConfigured = true
    } else {
      this.logger.warn('VAPID keys not fully configured. Web Push is disabled.')
    }
  }

  async registerDevice(dto: RegisterDeviceDto, ctx: RequestContextDto): Promise<void> {
    const { token, platform, userAgent } = dto
    const { tenantId, userId } = ctx

    // Since token is unique per tenant, try to find existing
    let device = await this.deviceRepository.findOne({
      where: { tenantId, token },
    })

    if (device) {
      // Update existing if User ID changed (e.g. guest -> logged in)
      device.userId = userId || null
      device.platform = platform || device.platform
      device.userAgent = userAgent || device.userAgent
      await this.deviceRepository.save(device)
    } else {
      device = this.deviceRepository.create({
        token,
        tenantId,
        userId: userId || null,
        platform: platform || 'web',
        userAgent,
      })
      await this.deviceRepository.save(device)
    }
  }

  async unregisterDevice(dto: UnregisterDeviceDto, ctx: RequestContextDto): Promise<void> {
    const { tenantId } = ctx
    await this.deviceRepository.delete({ tenantId, token: dto.token })
  }

  async sendPushNotification(
    token: string,
    payload: { title: string; body: string; imageUrl?: string; url?: string },
    tenantId: string,
  ): Promise<{ success: boolean; messageId?: string }> {
    if (!this.isConfigured) {
      this.logger.warn('Push notifications are not configured.')
      return { success: false }
    }

    try {
      const subscriptionInfo = JSON.parse(token)
      const data = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.imageUrl,
        url: payload.url,
      })

      const result = await webPush.sendNotification(subscriptionInfo, data)
      return { success: true, messageId: result.headers['location'] }
    } catch (error) {
      this.logger.error(`[PUSH ERROR] Failed to send push to tenant ${tenantId}`, error.stack)
      if (error.statusCode === 410 || error.statusCode === 404) {
        // Subscription is no longer valid, delete it
        this.logger.log(`Removing invalid push token for tenant ${tenantId}`)
        await this.deviceRepository.delete({ tenantId, token })
      }
      return { success: false }
    }
  }

  async sendToUser(userId: string, payload: any, tenantId: string): Promise<void> {
    const devices = await this.deviceRepository.find({
      where: { userId, tenantId },
    })

    for (const device of devices) {
      await this.sendPushNotification(device.token, payload, tenantId)
    }
  }
}
