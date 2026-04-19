import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name)

  async sendSms(
    phoneNumber: string,
    message: string,
    tenantId: string,
  ): Promise<{ success: boolean; messageId: string }> {
    this.logger.log(`[SMS MOCK] Sending to ${phoneNumber} (Tenant: ${tenantId}): ${message}`)

    // Simulate API call
    return {
      success: true,
      messageId: `mock-sms-${Date.now()}`,
    }
  }
}
