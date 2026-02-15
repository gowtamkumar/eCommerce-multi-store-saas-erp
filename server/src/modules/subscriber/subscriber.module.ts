import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriberEntity } from './entities/subscriber.entity';
import { SubscriberController } from './subscriber.controller';
import { SubscriberService } from './subscriber.service';

@Module({
    imports: [TypeOrmModule.forFeature([SubscriberEntity])],
    controllers: [SubscriberController],
    providers: [SubscriberService],
})
export class SubscriberModule { }
