import { RequestContextDto } from '@/common/dto/request-context.dto'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
  ) { }

  async sendSms(
    phone: string,
    message: string,
    tenantId: string,
  ): Promise<{ success: boolean; messageId: string }> {
    this.logger.log(`Sending SMS to ${phone} (Tenant: ${tenantId})`)

    try {
      // 1. Resolve Credentials (Tenant Settings > Global Config)
      const { apiKey, senderId } = await this.getCredentials(tenantId)

      if (!apiKey || !senderId) {
        this.logger.error(`SMS credentials missing for tenant ${tenantId}`)
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

      this.logger.warn(`Bulksmsbd API returned error code ${res.data?.response_code}: ${res.data?.success_message || 'Unknown error'}`)
      return {
        success: false,
        messageId: '',
      }
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phone}`, error.stack)
      return {
        success: false,
        messageId: '',
      }
    }
  }

  private async getCredentials(tenantId: string): Promise<{ apiKey: string; senderId: string }> {
    // Try to get from tenant settings
    if (tenantId) {
      const settings = await this.settingsService.findByTenantSettings({
        tenantId,
      } as RequestContextDto)

      if (settings?.sms?.apiKey && settings?.sms?.senderId) {
        return {
          apiKey: settings.sms.apiKey,
          senderId: settings.sms.senderId,
        }
      }
    }

    // Fallback to global config
    return {
      apiKey: this.configService.get<string>('BULKSMSBD_API_KEY'),
      senderId: this.configService.get<string>('BULKSMSBD_SENDER_ID'),
    }
  }
}
