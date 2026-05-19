import { Module } from '@nestjs/common'
import { CacheModule } from './cache/cache.module'
import { FileModule } from './file/file.module'
import { MailModule } from './mail/mail.module'
import { PushModule } from './push/push.module'
import { SmsModule } from './sms/sms.module'
import { NotificationModule } from './notification/notification.module'
import { ChatModule } from './chat/chat.module'

@Module({
  imports: [CacheModule, MailModule, FileModule, SmsModule, PushModule, NotificationModule, ChatModule],
  exports: [CacheModule, MailModule, FileModule, SmsModule, PushModule, NotificationModule, ChatModule],
})
export class InfraModule {}
