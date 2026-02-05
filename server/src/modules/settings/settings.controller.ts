import { Body, Controller, Get, Put } from '@nestjs/common'
import { TenantId } from '../../common/decorators/tenant-id.decorator'
import { UpdateSiteSettingsDto } from './dto/settings.dto'
import { SettingsService } from './settings.service'

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@TenantId() tenantId: string) {
    return await this.settingsService.findByTenant(tenantId)
  }

  @Put()
  async updateSettings(@TenantId() tenantId: string, @Body() dto: UpdateSiteSettingsDto) {
    return await this.settingsService.update(tenantId, dto)
  }
}
