import { Injectable, Logger } from '@nestjs/common'
import { PlatformSettingsRepository } from './platform-settings.repository'
import { PlatformSettingsEntity } from './entities/platform-settings.entity'
import { UpdatePlatformAiConfigDto } from './dto/platform-ai-config.dto'
import {
  isPlatformAiProviderReady,
  mergePlatformAiConfigUpdate,
  normalizePlatformAiConfig,
  toPlatformAiConfigResponse,
} from './utils/platform-ai.util'

function omitAiConfig(settings: PlatformSettingsEntity): Omit<PlatformSettingsEntity, 'aiConfig'> {
  const { aiConfig: _aiConfig, ...rest } = settings
  return rest as Omit<PlatformSettingsEntity, 'aiConfig'>
}

@Injectable()
export class PlatformSettingsService {
  private readonly logger = new Logger(PlatformSettingsService.name)

  constructor(private readonly platformSettingsRepository: PlatformSettingsRepository) {}

  async getPlatformSettings(): Promise<PlatformSettingsEntity> {
    this.logger.log(`${this.getPlatformSettings.name} Service Called`)
    let settings = await this.platformSettingsRepository.findSettings()

    if (!settings) {
      settings = await this.platformSettingsRepository.createDefaultSettings()
    }

    return settings
  }

  async getPublicPlatformSettings(): Promise<Omit<PlatformSettingsEntity, 'aiConfig'>> {
    const settings = await this.getPlatformSettings()
    return omitAiConfig(settings)
  }

  async getPlatformAiConfig() {
    const settings = await this.getPlatformSettings()
    return toPlatformAiConfigResponse(settings.aiConfig)
  }

  async getResolvedPlatformAiConfig() {
    const settings = await this.getPlatformSettings()
    return normalizePlatformAiConfig(settings.aiConfig)
  }

  async isPlatformAiReady(): Promise<boolean> {
    return isPlatformAiProviderReady(await this.getResolvedPlatformAiConfig())
  }

  async updatePlatformAiConfig(dto: UpdatePlatformAiConfigDto) {
    const settings = await this.getPlatformSettings()
    const merged = mergePlatformAiConfigUpdate(settings.aiConfig, dto)
    const updated = await this.platformSettingsRepository.updateAndSave(settings, {
      aiConfig: merged,
    })
    return toPlatformAiConfigResponse(updated.aiConfig)
  }

  async updatePlatformSettings(data: any): Promise<Omit<PlatformSettingsEntity, 'aiConfig'>> {
    this.logger.log(`${this.updatePlatformSettings.name} Service Called`)
    const settings = await this.getPlatformSettings()
    const { aiConfig: _aiConfig, ...safeData } = data ?? {}
    const updated = await this.platformSettingsRepository.updateAndSave(settings, safeData)
    return omitAiConfig(updated)
  }
}
