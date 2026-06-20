import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { PlatformModule } from '@/modules/system/platform/platform.module'
import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MailService } from './mail.service'

@Module({
  imports: [ConfigModule, SettingsModule, CacheModule, forwardRef(() => PlatformModule)],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
