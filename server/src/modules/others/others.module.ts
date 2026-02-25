import { Module } from '@nestjs/common';
import { CacheModule } from './cache/cache.module';
import { PathaoModule } from './courier/pathao/pathao.module';
import { SteadfastModule } from './courier/steadfast/steadfast.module';
import { FileModule } from './file/file.module';
import { MailModule } from './mail/mail.module';


@Module({
  imports: [FileModule,MailModule, PathaoModule, SteadfastModule, CacheModule],
  // exports: [FileModule,MailModule, PathaoModule, SteadfastModule, CacheModule],
})
export class OthersModule { }
