import { Module } from '@nestjs/common'
import { SubscriberController } from './subscriber.controller'
import { SubscriberService } from './subscriber.service'
import { SubscriberRepository } from './subscriber.repository'

@Module({
  imports: [],
  controllers: [SubscriberController],
  providers: [SubscriberService, SubscriberRepository],
  exports: [SubscriberService, SubscriberRepository],
})
export class SubscriberModule {}
