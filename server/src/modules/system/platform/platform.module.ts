import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PlatformSettingsEntity } from './entities/platform-settings.entity'
import { PlatformSettingsRepository } from './platform-settings.repository'
import { PlatformSettingsController } from './platform-settings.controller'
import { PlatformSettingsService } from './platform-settings.service'
import { PlatformAiClientService } from './services/platform-ai-client.service'
import { PlatformAiService } from './services/platform-ai.service'

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSettingsEntity])],
  controllers: [PlatformSettingsController],
  providers: [
    PlatformSettingsService,
    PlatformSettingsRepository,
    PlatformAiClientService,
    PlatformAiService,
  ],
  exports: [
    PlatformSettingsService,
    PlatformSettingsRepository,
    PlatformAiClientService,
    PlatformAiService,
  ],
})
export class PlatformModule {}
