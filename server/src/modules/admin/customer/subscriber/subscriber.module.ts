import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { SubscriberController } from './subscriber.controller'
import { SubscriberRepository } from './subscriber.repository'
import { SubscriberService } from './subscriber.service'
import { SubscriberEntity } from './entities/subscriber.entity'
import { MailModule } from '@/modules/admin/operations/infra/mail/mail.module'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [TypeOrmModule.forFeature([SubscriberEntity]), CacheModule, TenantModule, MailModule],
  controllers: [SubscriberController],
  providers: [SubscriberService, SubscriberRepository],
  exports: [SubscriberService, SubscriberRepository],
})
export class SubscriberModule {}
