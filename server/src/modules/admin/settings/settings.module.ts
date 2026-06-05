import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SiteSettingsEntity } from './entities/site-settings.entity'
import { SiteSettingsRepository } from './site-settings.repository'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'

@Module({
  imports: [TypeOrmModule.forFeature([SiteSettingsEntity]), CacheModule],
  controllers: [SettingsController],
  providers: [SettingsService, SiteSettingsRepository],
  exports: [SettingsService, SiteSettingsRepository],
})
export class SettingsModule {}
