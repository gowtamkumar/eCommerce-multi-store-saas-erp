import { Body, Controller, Get, Put } from '@nestjs/common'
import { TenantId } from '../../common/decorators/tenant-id.decorator'
import { UpdateSiteSettingsDto } from './dto/settings.dto'
import { SettingsService } from './settings.service'

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

  @Get()
  async findByTenantSettings(@TenantId() tenantId: string) {
    return await this.settingsService.findByTenantSettings(tenantId)
  }

  @Put()
  async updateSettings(@TenantId() tenantId: string, @Body() dto: UpdateSiteSettingsDto) {
    return await this.settingsService.updateSettings(tenantId, dto)
  }
}
