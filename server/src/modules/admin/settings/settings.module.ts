import { Module } from '@nestjs/common'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'

@Module({
  imports: [CacheModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
