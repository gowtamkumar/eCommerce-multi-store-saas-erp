import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UpdateSiteSettingsDto } from './dto/settings.dto'
import { SiteSettingsEntity } from './entities/site-settings.entity'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name)

  constructor(
    @InjectRepository(SiteSettingsEntity)
    private settingsRepository: Repository<SiteSettingsEntity>,
    @InjectRepository(TenantEntity)
    private tenantRepository: Repository<TenantEntity>,
  ) { }

  async findByTenantSettings(tenantId: string) {
    this.logger.log(`${this.findByTenantSettings.name} Service Called`)
    let settings = await this.settingsRepository.findOne({ where: { tenantId } })
    // Create default settings if not exists
    if (!settings) {
      settings = this.settingsRepository.create({ tenantId })
      await this.settingsRepository.save(settings)
    }

    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      select: ['status', 'subscriptionEndsAt']
    })

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
    const settings = await this.findByTenantSettings(tenantId)
    Object.assign(settings, dto)
    return await this.settingsRepository.save(settings)
  }
}
