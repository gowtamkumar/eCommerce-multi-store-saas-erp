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

  async findAllWithFilters(
    filterDto: any,
  ): Promise<{ subscribers: SubscriberEntity[]; total: number }> {
    const { page = 1, limit = 10, search } = filterDto
    const query = this.repo.createQueryBuilder('subscriber')

    if (search) {
      query.where('subscriber.email ILIKE :search', { search: `%${search}%` })
    }

    const [subscribers, total] = await query
      .orderBy('subscriber.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return { subscribers, total }
  }
}
