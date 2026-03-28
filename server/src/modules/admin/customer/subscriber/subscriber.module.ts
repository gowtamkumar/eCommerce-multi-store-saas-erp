import { Module } from '@nestjs/common'
import { SubscriberController } from './subscriber.controller'
import { SubscriberRepository } from './subscriber.repository'
import { SubscriberService } from './subscriber.service'

@Module({
  imports: [],
  controllers: [SubscriberController],
  providers: [SubscriberService],
  exports: [SubscriberService],
})
export class SubscriberModule {}
