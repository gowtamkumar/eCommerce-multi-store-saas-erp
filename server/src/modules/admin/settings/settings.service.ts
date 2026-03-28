import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UpdateSiteSettingsDto } from './dto/settings.dto'
import { SiteSettingsEntity } from './entities/site-settings.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { SiteSettingsRepository } from './site-settings.repository'
import { TenantRepository } from '@/modules/system/tenant/tenant.repository'

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name)

  constructor(
    private settingsRepository: SiteSettingsRepository,
    private tenantRepository: TenantRepository,
  ) { }

  async findByTenantSettings(tenantId: string) {
    this.logger.log(`${this.findByTenantSettings.name} Service Called`)
    let settings = await this.settingsRepository.findByTenantId(tenantId)
    // Create default settings if not exists
    if (!settings) {
      settings = await this.settingsRepository.createAndSave({}, tenantId)
    }

    const tenant = await this.tenantRepository.findTenantById(tenantId)

    let effectiveStatus = tenant?.status

    // Check if subscription has logically expired
    if (tenant?.isExpired) {
      effectiveStatus = TenantStatus.EXPIRED
    }

    return {
      ...settings,
      status: effectiveStatus,
    }
  }

  async updateSettings(tenantId: string, dto: UpdateSiteSettingsDto) {
    this.logger.log(`${this.updateSettings.name} Service Called`)
    const settings = await this.settingsRepository.findByTenantId(tenantId)
    if (!settings) throw new Error('Settings not found')
    return await this.settingsRepository.updateAndSave(settings, dto)
  }
}
