import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { SmsService } from './sms.service'

@Module({
  imports: [ConfigModule, SettingsModule],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule { }
