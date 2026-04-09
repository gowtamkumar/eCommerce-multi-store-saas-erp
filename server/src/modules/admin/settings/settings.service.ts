import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { TenantRepository } from '@/modules/system/tenant/tenant.repository'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { UpdateSiteSettingsDto } from './dto/settings.dto'
import { SiteSettingsEntity } from './entities/site-settings.entity'
import { SiteSettingsRepository } from './site-settings.repository'

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name)

  constructor(
    private settingsRepository: SiteSettingsRepository,
    private tenantRepository: TenantRepository,
    private cacheService: CacheService,
  ) { }

  async findByTenantSettings(tenantId: string): Promise<SiteSettingsEntity & { status: string }> {
    this.logger.log(`${this.findByTenantSettings.name} Service Called for tenant: ${tenantId}`)
    const cacheKey = `settings:${tenantId}:site`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
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
      },
      86400, // 24 hours
      tenantId
    )
  }

  async updateSettings(tenantId: string, dto: UpdateSiteSettingsDto): Promise<SiteSettingsEntity> {
    this.logger.log(`${this.updateSettings.name} Service Called for tenant: ${tenantId}`)
    const settings = await this.settingsRepository.findByTenantId(tenantId)
    if (!settings) throw new NotFoundException('Settings not found')
    
    const updated = await this.settingsRepository.updateAndSave(settings, dto)
    
    // Invalidate cache
    await this.cacheService.delCache(`settings:${tenantId}:site`, tenantId)
    
    return updated
  }
  async createSetting(tenantId: string, dto: UpdateSiteSettingsDto): Promise<SiteSettingsEntity> {
    this.logger.log(`${this.createSetting.name} Service Called`)
    return await this.settingsRepository.createAndSave(dto, tenantId)
  }
}
