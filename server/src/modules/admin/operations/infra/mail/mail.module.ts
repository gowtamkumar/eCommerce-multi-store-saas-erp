import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MailService } from './mail.service'
import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'

@Module({
  imports: [ConfigModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
