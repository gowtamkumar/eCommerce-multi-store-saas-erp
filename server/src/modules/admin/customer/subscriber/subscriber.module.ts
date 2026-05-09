import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@/modules/admin/operations/infra/cache/cache.module'
import { SubscriberController } from './subscriber.controller'
import { SubscriberRepository } from './subscriber.repository'
import { SubscriberService } from './subscriber.service'
import { SubscriberEntity } from './entities/subscriber.entity'

import { TenantModule } from '@/modules/system/tenant/tenant.module'

@Module({
  imports: [TypeOrmModule.forFeature([SubscriberEntity]), CacheModule, TenantModule],
  controllers: [SubscriberController],
  providers: [SubscriberService, SubscriberRepository],
  exports: [SubscriberService],
})
export class SubscriberModule {}
