import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlatformSettingsService } from './platform-settings.service';

@ApiTags('Platform Settings')
@Controller('platform/settings')
export class PlatformSettingsController {
  constructor(private readonly platformSettingsService: PlatformSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global platform settings' })
  @ApiResponse({ status: 200, description: 'Returns platform settings' })
  async getSettings() {
    return await this.platformSettingsService.getSettings();
  }

  @Put()
  @ApiOperation({ summary: 'Update global platform settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateSettings(@Body() data: any) {
    return await this.platformSettingsService.updateSettings(data);
  }
}
