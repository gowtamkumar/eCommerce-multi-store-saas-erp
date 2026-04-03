import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SubscriberEntity } from './entities/subscriber.entity'

@Injectable()
export class SubscriberRepository {
  constructor(
    @InjectRepository(SubscriberEntity)
    private readonly repo: Repository<SubscriberEntity>,
  ) { }

  async findByEmail(email: string): Promise<SubscriberEntity | null> {
    return this.repo.findOne({ where: { email } })
  }

  async createAndSave(dto: any): Promise<SubscriberEntity> {
    const subscriber = this.repo.create(dto as SubscriberEntity)
    return this.repo.save(subscriber)
  }

  async findAllDesc(): Promise<SubscriberEntity[]> {
    return this.repo.find({
      order: { createdAt: 'DESC' },
    })
  }
}
