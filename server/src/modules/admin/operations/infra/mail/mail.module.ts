import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MailService } from './mail.service'

@Module({
  imports: [ConfigModule, SettingsModule, CacheModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
