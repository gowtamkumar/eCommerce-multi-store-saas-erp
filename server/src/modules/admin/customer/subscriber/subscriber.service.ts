import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubscriberDto } from './dto/subscriber.dto';
import { SubscriberEntity } from './entities/subscriber.entity';

@Injectable()
export class SubscriberService {
    private readonly logger = new Logger(SubscriberService.name);

    constructor(
        @InjectRepository(SubscriberEntity)
        private readonly subscriberRepository: Repository<SubscriberEntity>,
    ) { }

    async createSubscriber(createSubscriberDto: CreateSubscriberDto) {
        this.logger.log(`${this.createSubscriber.name} Service Called`);
        const existingSubscriber = await this.subscriberRepository.findOne({
            where: { email: createSubscriberDto.email },
        });

        if (existingSubscriber) {
            throw new ConflictException('Email is already subscribed');
        }

        const subscriber = this.subscriberRepository.create(createSubscriberDto);
        return await this.subscriberRepository.save(subscriber);
    }

    async findAllSubscribers() {
        this.logger.log(`${this.findAllSubscribers.name} Service Called`);
        return await this.subscriberRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
}
