import { RequestContextDto } from '@/common/dto/request-context.dto'
import { TenantStatus } from '@/common/enums/tenant/tenant-status.enum'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { TenantRepository } from '@/modules/system/tenant/tenant.repository'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { UpdateSiteSettingsDto } from './dto/settings.dto'
import { SiteSettingsEntity } from './entities/site-settings.entity'
import { SiteSettingsRepository } from './site-settings.repository'
import { normalizeAndValidateSettingsUpdate } from './settings-validation.util'

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name)

  constructor(
    private settingsRepository: SiteSettingsRepository,
    private tenantRepository: TenantRepository,
    private cacheService: CacheService,
  ) {}

  async findByTenantSettings(
    ctx: RequestContextDto,
  ): Promise<SiteSettingsEntity & { status: string }> {
    this.logger.log(`${this.findByTenantSettings.name} Service Called for tenant: ${ctx.tenantId}`)
    const tenantId = ctx.tenantId
    const cacheKey = `settings:${tenantId}:site`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        let settings = await this.settingsRepository.findByTenantId(tenantId)
        // Create default settings if not exists
        if (!settings) {
          try {
            settings = await this.settingsRepository.createAndSave({}, ctx)
          } catch (err: any) {
            // Handle race condition if another thread created it concurrently
            if (
              err.code === '23505' ||
              err.message?.includes('unique') ||
              err.message?.includes('duplicate')
            ) {
              settings = await this.settingsRepository.findByTenantId(tenantId)
            } else {
              throw err
            }
          }
        }

        const tenant = await this.tenantRepository.findByIdWithRelations(tenantId)
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
      tenantId,
    )
  }

  async updateSettings(
    ctx: RequestContextDto,
    dto: UpdateSiteSettingsDto,
  ): Promise<SiteSettingsEntity> {
    const tenantId = ctx.tenantId
    const settings = await this.settingsRepository.findByTenantId(tenantId)
    if (!settings) throw new NotFoundException('Settings not found')

    const normalizedDto = normalizeAndValidateSettingsUpdate(dto, settings)

    if (normalizedDto.removeBranding === true) {
      const tenant = await this.tenantRepository.findByIdWithRelations(tenantId)
      const features = tenant?.subscriptionPlan?.features || []
      const hasRemoveBranding = features.includes('remove_branding')
      if (!hasRemoveBranding) {
        normalizedDto.removeBranding = false // Force off if plan doesn't support it
      }
    }

    const updated = await this.settingsRepository.updateAndSave(settings, normalizedDto)

    // Invalidate cache
    await this.cacheService.delCache(`settings:${tenantId}:site`, tenantId)

    return updated
  }
  async createSetting(
    ctx: RequestContextDto,
    dto: UpdateSiteSettingsDto,
  ): Promise<SiteSettingsEntity> {
    this.logger.log(`${this.createSetting.name} Service Called`)
    const tenantId = ctx.tenantId

    // Check if settings already exist
    const existing = await this.settingsRepository.findByTenantId(tenantId)
    if (existing) {
      this.logger.log(`Site settings already exist for tenant ${tenantId}, updating instead.`)
      return await this.settingsRepository.updateAndSave(
        existing,
        normalizeAndValidateSettingsUpdate(dto, existing),
      )
    }

    try {
      return await this.settingsRepository.createAndSave(
        normalizeAndValidateSettingsUpdate(dto),
        ctx,
      )
    } catch (err: any) {
      if (
        err.code === '23505' ||
        err.message?.includes('unique') ||
        err.message?.includes('duplicate')
      ) {
        const latest = await this.settingsRepository.findByTenantId(tenantId)
        if (latest) {
          return await this.settingsRepository.updateAndSave(
            latest,
            normalizeAndValidateSettingsUpdate(dto, latest),
          )
        }
      }
      throw err
    }
  }
}
