import { Body, Controller, Get, Patch } from '@nestjs/common'
import { PlatformSettingsService } from './platform-settings.service'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { PlatformSettingsResponseDto } from './dto/platform-settings-response.dto'

@Controller('platform/settings')
export class PlatformSettingsController {
  constructor(private readonly platformSettingsService: PlatformSettingsService) {}

  @Get()
  async getPlatformSettings(): Promise<BaseApiSuccessResponse<PlatformSettingsResponseDto>> {
    const settings = await this.platformSettingsService.getPlatformSettings()
    return {
      success: true,
      statusCode: 200,
      message: 'Platform settings retrieved successfully',
      data: settings as any,
    }
  }

  @Patch()
  async updatePlatformSettings(
    @Body() data: any,
  ): Promise<BaseApiSuccessResponse<PlatformSettingsResponseDto>> {
    const settings = await this.platformSettingsService.updatePlatformSettings(data)
    return {
      success: true,
      statusCode: 200,
      message: 'Platform settings updated successfully',
      data: settings as any,
    }
  }
}
