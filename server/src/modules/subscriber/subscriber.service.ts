import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubscriberDto } from './dto/subscriber.dto';
import { SubscriberEntity } from './entities/subscriber.entity';

@Injectable()
export class SubscriberService {
    constructor(
        @InjectRepository(SubscriberEntity)
        private readonly subscriberRepository: Repository<SubscriberEntity>,
    ) { }

    async create(createSubscriberDto: CreateSubscriberDto) {
        const existingSubscriber = await this.subscriberRepository.findOne({
            where: { email: createSubscriberDto.email },
        });

        if (existingSubscriber) {
            throw new ConflictException('Email is already subscribed');
        }

        const subscriber = this.subscriberRepository.create(createSubscriberDto);
        return await this.subscriberRepository.save(subscriber);
    }

    async findAll() {
        return await this.subscriberRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
}
