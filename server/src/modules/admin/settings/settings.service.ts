import { RequestContextDto } from '@/common/dto/request-context.dto'
import { StoreStatus } from '@/common/enums/store/store-status.enum'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { StoreRepository } from '@/modules/system/store/store.repository'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { UpdateSiteSettingsDto } from './dto/settings.dto'
import { SiteSettingsEntity } from './entities/site-settings.entity'
import { SiteSettingsRepository } from './site-settings.repository'
import { normalizeAndValidateSettingsUpdate } from './settings-validation.util'
import { BASIC_DEFAULT_SETTINGS } from './settings.constants'

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name)

  constructor(
    private settingsRepository: SiteSettingsRepository,
    private storeRepository: StoreRepository,
    private cacheService: CacheService,
  ) {}

  async findByStoreSettings(
    ctx: RequestContextDto,
  ): Promise<SiteSettingsEntity & { status: string }> {
    this.logger.log(`${this.findByStoreSettings.name} Service Called for store: ${ctx.storeId}`)
    const storeId = ctx.storeId
    const cacheKey = `settings:${storeId}:site`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        let settings = await this.settingsRepository.findByStoreId(storeId)

        // Lazy-create settings if the onboarding call somehow missed it.
        // Pass an empty DTO so only DEFAULT_SETTINGS are used as the base —
        // the caller context (storeId) is the only required field.
        if (!settings) {
          this.logger.warn(
            `[Settings] No settings row found for store ${storeId} — creating defaults now.`,
          )
          settings = await this.createSetting(ctx, {})
        }

        const store = await this.storeRepository.findByIdWithRelations(storeId)
        let effectiveStatus = store?.status

        // Check if subscription has logically expired
        if (store?.isExpired) {
          effectiveStatus = StoreStatus.EXPIRED
        }

        return {
          ...settings,
          status: effectiveStatus,
        }
      },
      86400, // 24 hours
      storeId,
    )
  }

  async updateSettings(
    ctx: RequestContextDto,
    dto: UpdateSiteSettingsDto,
  ): Promise<SiteSettingsEntity> {
    const storeId = ctx.storeId
    const settings = await this.settingsRepository.findByStoreId(storeId)
    if (!settings) throw new NotFoundException('Settings not found')

    const normalizedDto = normalizeAndValidateSettingsUpdate(dto, settings)

    if (normalizedDto.removeBranding === true) {
      const store = await this.storeRepository.findByIdWithRelations(storeId)
      const features = store?.subscriptionPlan?.features || []
      const hasRemoveBranding = features.includes('remove_branding')
      if (!hasRemoveBranding) {
        normalizedDto.removeBranding = false // Force off if plan doesn't support it
      }
    }

    const updated = await this.settingsRepository.updateAndSave(settings, normalizedDto)

    // Invalidate cache
    await this.cacheService.delCache(`settings:${storeId}:site`, storeId)

    return updated
  }

  /**
   * Idempotent settings creation for new or existing stores.
   *
   * Bug fixes applied:
   *
   * 1. Spread order fix: `{ ...DEFAULT_SETTINGS, ...dto }` — user-supplied values
   *    (brandName, contactEmail, siteDescription from onboarding) WIN over defaults.
   *    Previously `{ ...dto, ...DEFAULT_SETTINGS }` meant DEFAULT_SETTINGS always
   *    overwrote every caller-supplied field, so every new store got "LuxeAudio".
   *
   * 2. Idempotent upsert on duplicate key: handles race conditions where the onboarding
   *    transaction committed the store row but the parallel createSetting() is called
   *    twice (e.g., retried webhook). Returns the existing row safely.
   *
   * @param ctx - Must contain at minimum `storeId`
   * @param dto - Caller-supplied overrides. Empty object `{}` is valid (uses all defaults).
   */
  async createSetting(
    ctx: RequestContextDto,
    dto: UpdateSiteSettingsDto,
    manager?: EntityManager,
  ): Promise<SiteSettingsEntity> {
    this.logger.log(`${this.createSetting.name} Service Called for store: ${ctx.storeId}`)
    const storeId = ctx.storeId

    // Check if settings already exist — idempotent upsert
    const existing = await this.settingsRepository.findByStoreId(storeId, manager)
    if (existing) {
      this.logger.log(
        `[Settings] Row already exists for store ${storeId}, merging caller overrides.`,
      )
      // Only update with the explicitly caller-supplied dto fields (not DEFAULT_SETTINGS again).
      // This avoids overwriting deliberate user customisations with defaults on re-creation.
      if (Object.keys(dto).length > 0) {
        return await this.settingsRepository.updateAndSave(
          existing,
          normalizeAndValidateSettingsUpdate(dto, existing),
          manager,
        )
      }
      return existing
    }

    // ── BUG FIX: Spread order — BASIC_DEFAULT_SETTINGS first, dto second ─────────────
    // Only basic settings are persisted to the database on store onboarding/creation.
    // Complex structures (navbar, footer, theme, etc.) are kept as null in the DB
    // and merged dynamically from code-level DEFAULT_SETTINGS upon request.
    const mergedDto: UpdateSiteSettingsDto = {
      ...BASIC_DEFAULT_SETTINGS,
      ...dto,
    }

    try {
      return await this.settingsRepository.createAndSave(
        normalizeAndValidateSettingsUpdate(mergedDto),
        ctx,
        manager,
      )
    } catch (err: any) {
      // Handle duplicate-key race (two concurrent onboarding calls for the same store).
      // Fetch and return the winner's row rather than propagating an obscure DB error.
      if (
        err.code === '23505' ||
        err.message?.includes('unique') ||
        err.message?.includes('duplicate')
      ) {
        this.logger.warn(
          `[Settings] Duplicate key on create for store ${storeId} — returning existing row.`,
        )
        const latest = await this.settingsRepository.findByStoreId(storeId, manager)
        if (latest) {
          // If the caller also supplied overrides, apply them on top of the winning row.
          if (Object.keys(dto).length > 0) {
            return await this.settingsRepository.updateAndSave(
              latest,
              normalizeAndValidateSettingsUpdate(dto, latest),
              manager,
            )
          }
          return latest
        }
      }
      throw err
    }
  }
}
