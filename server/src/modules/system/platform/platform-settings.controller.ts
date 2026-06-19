import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { Body, Controller, Get, HttpCode, Logger, Patch, Post, Put, UseGuards } from '@nestjs/common'
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

@Controller('platform/settings')
export class PlatformSettingsController {
  private readonly logger = new Logger(PlatformSettingsController.name)

  constructor(
    private readonly platformSettingsService: PlatformSettingsService,
    private readonly platformAiClient: PlatformAiClientService,
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
}
