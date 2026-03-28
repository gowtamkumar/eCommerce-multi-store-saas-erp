import { Injectable, Logger } from '@nestjs/common'
import { PlatformSettingsRepository } from './platform-settings.repository'
import { PlatformSettingsEntity } from './entities/platform-settings.entity'

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

  async updatePlatformSettings(data: any): Promise<PlatformSettingsEntity> {
    this.logger.log(`${this.updatePlatformSettings.name} Service Called`)
    const settings = await this.getPlatformSettings()
    return await this.platformSettingsRepository.updateAndSave(settings, data)
  }
}
