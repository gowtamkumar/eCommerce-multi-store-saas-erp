import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { SubscriberEntity } from './entities/subscriber.entity'

@Injectable()
export class SubscriberRepository extends Repository<SubscriberEntity> {
  constructor(private dataSource: DataSource) {
    super(SubscriberEntity, dataSource.createEntityManager())
  }

  async findByEmail(email: string): Promise<SubscriberEntity | null> {
    return this.findOne({ where: { email } })
  }

  async createAndSave(dto: any): Promise<SubscriberEntity> {
    const subscriber = this.create(dto as SubscriberEntity)
    return this.save(subscriber)
  }

  async findAllDesc(): Promise<SubscriberEntity[]> {
    return this.find({
      order: { createdAt: 'DESC' },
    })
  }
}
