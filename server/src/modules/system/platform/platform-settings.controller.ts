import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { Body, Controller, Get, HttpCode, Logger, Patch, Post, Put, UseGuards, Inject, forwardRef } from '@nestjs/common'
import { Public } from '@/common/decorators/public.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { PlatformSettingsResponseDto } from './dto/platform-settings-response.dto'
import {
  PlatformAiConfigResponseDto,
  TestPlatformAiConfigDto,
  UpdatePlatformAiConfigDto,
} from './dto/platform-ai-config.dto'
import { PlatformSettingsService } from './platform-settings.service'
import { PlatformAiClientService } from './services/platform-ai-client.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { SmsService } from '@/modules/admin/operations/infra/sms/sms.service'
import { TestEmailDto, TestSmsDto } from './dto/test-settings.dto'

@Controller('platform/settings')
export class PlatformSettingsController {
  private readonly logger = new Logger(PlatformSettingsController.name)

  constructor(
    private readonly platformSettingsService: PlatformSettingsService,
    private readonly platformAiClient: PlatformAiClientService,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
    @Inject(forwardRef(() => SmsService))
    private readonly smsService: SmsService,
  ) {}

  @Public()
  @Get()
  async getPlatformSettings(): Promise<BaseApiSuccessResponse<PlatformSettingsResponseDto>> {
    this.logger.verbose('getPlatformSettings called.')
    const settings = await this.platformSettingsService.getPublicPlatformSettings()
    return {
      success: true,
      statusCode: 200,
      message: 'Platform settings retrieved successfully',
      data: settings as any,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Put()
  async updatePlatformSettings(
    @Body() data: any,
  ): Promise<BaseApiSuccessResponse<PlatformSettingsResponseDto>> {
    this.logger.verbose('updatePlatformSettings called.')
    const settings = await this.platformSettingsService.updatePlatformSettings(data)
    return {
      success: true,
      statusCode: 200,
      message: 'Platform settings updated successfully',
      data: settings as any,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('ai-config')
  async getPlatformAiConfig(): Promise<BaseApiSuccessResponse<PlatformAiConfigResponseDto>> {
    const data = await this.platformSettingsService.getPlatformAiConfig()
    return {
      success: true,
      statusCode: 200,
      message: 'Platform AI configuration retrieved successfully',
      data,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('ai-config')
  async updatePlatformAiConfig(
    @Body() body: UpdatePlatformAiConfigDto,
  ): Promise<BaseApiSuccessResponse<PlatformAiConfigResponseDto>> {
    const data = await this.platformSettingsService.updatePlatformAiConfig(body)
    return {
      success: true,
      statusCode: 200,
      message: 'Platform AI configuration updated successfully',
      data,
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('ai-config/test')
  @HttpCode(200)
  async testPlatformAiConfig(
    @Body() body: TestPlatformAiConfigDto,
  ): Promise<BaseApiSuccessResponse<{ reply: string; model: string; totalTokens: number }>> {
    const result = await this.platformAiClient.testConnection(body.prompt || 'Reply with exactly: OK')
    return {
      success: true,
      statusCode: 200,
      message: 'Platform AI connection successful',
      data: {
        reply: result.content,
        model: result.model,
        totalTokens: result.totalTokens,
      },
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('test-email')
  @HttpCode(200)
  async testPlatformEmail(@Body() body: TestEmailDto) {
    await this.mailService.sendGenericEmail({
      to: body.email,
      subject: 'Platform SMTP Gateway Test',
      html: `<p>If you are receiving this message, your Platform SMTP Gateway configuration works correctly!</p>`,
      storeId: '',
    })
    return { success: true, message: 'Test email dispatched successfully' }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('test-sms')
  @HttpCode(200)
  async testPlatformSms(@Body() body: TestSmsDto) {
    const result = await this.smsService.sendSms(
      body.phone,
      'Platform SMS Gateway Test: If you receive this, your settings are active and correct!',
      '',
    )
    if (!result.success) {
      return { success: false, message: 'Failed to send test SMS. Check your API credentials.' }
    }
    return { success: true, message: 'Test SMS dispatched successfully', messageId: result.messageId }
  }
}
