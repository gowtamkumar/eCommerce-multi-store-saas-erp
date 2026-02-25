import { Body, Controller, Get, Put } from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service';

@Controller('platform/settings')
export class PlatformSettingsController {
  constructor(private readonly platformSettingsService: PlatformSettingsService) {}

  @Get()
  async getSettings() {
    return await this.platformSettingsService.getSettings();
  }

  @Put()
  async updateSettings(@Body() data: any) {
    return await this.platformSettingsService.updateSettings(data);
  }
}
