import { Body, Controller, Get, Put } from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service';

@Controller('platform/settings')
export class PlatformSettingsController {
  constructor(private readonly platformSettingsService: PlatformSettingsService) {}

  @Get()
  async getPlatformSettings() {
    return await this.platformSettingsService.getPlatformSettings();
  }

  @Put()
  async updatePlatformSettings(@Body() data: any) {
    return await this.platformSettingsService.updatePlatformSettings(data);
  }
}
