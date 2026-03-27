import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PlatformSettingsEntity } from './entities/platform-settings.entity'
import { PlatformSettingsController } from './platform-settings.controller'
import { PlatformSettingsService } from './platform-settings.service'

@Module({
  imports: [TypeOrmModule.forFeature([PlatformSettingsEntity])],
  controllers: [PlatformSettingsController],
  providers: [PlatformSettingsService],
  exports: [PlatformSettingsService],
})
export class PlatformModule {}
