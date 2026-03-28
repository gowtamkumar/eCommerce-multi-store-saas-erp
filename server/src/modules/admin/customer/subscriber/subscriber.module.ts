import { Module } from '@nestjs/common'
import { SubscriberController } from './subscriber.controller'
import { SubscriberRepository } from './subscriber.repository'
import { SubscriberService } from './subscriber.service'

@Module({
  imports: [],
  controllers: [SubscriberController],
  providers: [SubscriberService, SubscriberRepository],
  exports: [SubscriberService, SubscriberRepository],
})
export class SubscriberModule {}
