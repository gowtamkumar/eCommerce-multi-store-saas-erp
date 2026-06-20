import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { PlatformModule } from '@/modules/system/platform/platform.module'
import { SmsService } from './sms.service'

@Module({
  imports: [ConfigModule, SettingsModule, forwardRef(() => PlatformModule)],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
