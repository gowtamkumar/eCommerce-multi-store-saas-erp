import { RequestContextDto } from '@/common/dto/request-context.dto'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { PlatformSettingsRepository } from '@/modules/system/platform/platform-settings.repository'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
    private readonly platformSettingsRepository: PlatformSettingsRepository,
  ) {}

  async sendSms(
    phone: string,
    message: string,
    storeId: string,
  ): Promise<{ success: boolean; messageId: string }> {
    this.logger.log(`Sending SMS to ${phone} (Store: ${storeId})`)

    try {
      // 1. Resolve Credentials (Store Settings > Global Config)
      const { apiKey, senderId } = await this.getCredentials(storeId)

      if (!apiKey || !senderId) {
        this.logger.error(`SMS credentials missing for store ${storeId}`)
        return { success: false, messageId: '' }
      }

      // 2. Prepare API Call
      const url = 'https://bulksmsbd.net/api/smsapi'
      const params = {
        api_key: apiKey,
        type: 'text',
        number: phone,
        senderid: senderId,
        message,
      }

      // 3. Execute request
      this.logger.debug(`Calling Bulksmsbd API for ${phone}`)
      const res = await axios.post(url, null, { params })

      // 4. Handle Response
      // Success response: { response_code: 202, success_message: '...', message_id: '...' }
      if (res.data?.response_code === 202 || res.data?.response_code === '202') {
        const messageId = res.data.message_id || `sms-${Date.now()}`
        this.logger.log(`SMS sent successfully to ${phone}. MessageID: ${messageId}`)
        return {
          success: true,
          messageId,
        }
      }

      this.logger.warn(
        `Bulksmsbd API returned error code ${res.data?.response_code}: ${res.data?.success_message || 'Unknown error'}`,
      )
      return {
        success: false,
        messageId: '',
      }
    } catch (error: any) {
      this.logger.error(`Failed to send SMS to ${phone}`, error.stack)
      return {
        success: false,
        messageId: '',
      }
    }
  }

  private async getCredentials(storeId: string): Promise<{ apiKey: string; senderId: string }> {
    // 1. Try to get from store settings
    if (storeId) {
      try {
        const settings = await this.settingsService.findByStoreSettings({
          storeId,
        } as RequestContextDto)

        if (settings?.sms?.apiKey && settings?.sms?.senderId) {
          return {
            apiKey: settings.sms.apiKey,
            senderId: settings.sms.senderId,
          }
        }
      } catch (err: any) {
        this.logger.error(`Failed to load store settings: ${err.message}. Falling back to platform SMS config.`)
      }
    }

    // 2. Try to get from platform settings
    try {
      const platformSettings = await this.platformSettingsRepository.findSettings()
      if (platformSettings?.sms?.apiKey && platformSettings?.sms?.senderId) {
        return {
          apiKey: platformSettings.sms.apiKey,
          senderId: platformSettings.sms.senderId,
        }
      }
    } catch (err: any) {
      this.logger.error(`Failed to load platform settings: ${err.message}. Falling back to environment variables.`)
    }

    // 3. Fallback to global config
    return {
      apiKey: this.configService.get<string>('BULKSMSBD_API_KEY'),
      senderId: this.configService.get<string>('BULKSMSBD_SENDER_ID'),
    }
  }
}
