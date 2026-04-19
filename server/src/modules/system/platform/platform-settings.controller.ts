import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { Body, Controller, Get, Logger, Put } from '@nestjs/common'
import { PlatformSettingsResponseDto } from './dto/platform-settings-response.dto'
import { PlatformSettingsService } from './platform-settings.service'

@Controller('platform/settings')
export class PlatformSettingsController {
  private readonly logger = new Logger(PlatformSettingsController.name)

  constructor(private readonly platformSettingsService: PlatformSettingsService) {}

  @Get()
  async getPlatformSettings(): Promise<BaseApiSuccessResponse<PlatformSettingsResponseDto>> {
    this.logger.verbose('getPlatformSettings called.')
    const settings = await this.platformSettingsService.getPlatformSettings()
    return {
      success: true,
      statusCode: 200,
      message: 'Platform settings retrieved successfully',
      data: settings as any,
    }
  }

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
}
