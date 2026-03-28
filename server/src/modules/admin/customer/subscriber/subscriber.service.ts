import { ConflictException, Injectable, Logger } from '@nestjs/common'
import { CreateSubscriberDto } from './dto/subscriber.dto'
import { SubscriberRepository } from './subscriber.repository'

@Injectable()
export class SubscriberService {
  private readonly logger = new Logger(SubscriberService.name)

  constructor(private readonly subscriberRepository: SubscriberRepository) {}

  async createSubscriber(createSubscriberDto: CreateSubscriberDto) {
    this.logger.log(`${this.createSubscriber.name} Service Called`)
    const existingSubscriber = await this.subscriberRepository.findByEmail(
      createSubscriberDto.email,
    )

    if (existingSubscriber) {
      throw new ConflictException('Email is already subscribed')
    }

    return await this.subscriberRepository.createAndSave(createSubscriberDto)
  }

  async findAllSubscribers() {
    this.logger.log(`${this.findAllSubscribers.name} Service Called`)
    return await this.subscriberRepository.findAllDesc()
  }
}
