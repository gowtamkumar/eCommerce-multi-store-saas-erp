import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PlatformSettingsEntity } from './entities/platform-settings.entity'
import { PlatformSettingsRepository } from './platform-settings.repository'
import { PlatformSettingsController } from './platform-settings.controller'
import { PlatformSettingsService } from './platform-settings.service'

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSettingsEntity])],
  controllers: [PlatformSettingsController],
  providers: [PlatformSettingsService, PlatformSettingsRepository],
  exports: [PlatformSettingsService, PlatformSettingsRepository],
})
export class PlatformModule {}
