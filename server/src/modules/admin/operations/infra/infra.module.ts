import { Module } from '@nestjs/common'
import { CacheModule } from './cache/cache.module'
import { FileModule } from './file/file.module'
import { MailModule } from './mail/mail.module'

@Module({
  imports: [CacheModule, MailModule, FileModule],
  exports: [CacheModule, MailModule, FileModule],
})
export class InfraModule {}
