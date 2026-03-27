import { Module } from '@nestjs/common'
import { CacheModule } from './cache/cache.module'
import { MailModule } from './mail/mail.module'
import { FileModule } from './media/file.module'

@Module({
  imports: [CacheModule, MailModule, FileModule],
  exports: [CacheModule, MailModule, FileModule],
})
export class InfraModule {}
