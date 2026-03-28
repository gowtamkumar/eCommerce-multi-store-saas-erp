import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubscriberEntity } from './entities/subscriber.entity'
import { SubscriberController } from './subscriber.controller'
import { SubscriberService } from './subscriber.service'
import { SubscriberRepository } from './subscriber.repository'

@Module({
  imports: [TypeOrmModule.forFeature([SubscriberEntity])],
  controllers: [SubscriberController],
  providers: [SubscriberService, SubscriberRepository],
  exports: [SubscriberService, SubscriberRepository],
})
export class SubscriberModule {}
