import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindManyOptions, Repository } from 'typeorm'
import { SubscriberEntity } from './entities/subscriber.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class SubscriberRepository extends BaseStoreRepository<SubscriberEntity> {
  constructor(
    @InjectRepository(SubscriberEntity)
    repo: Repository<SubscriberEntity>,
  ) {
    super(SubscriberEntity, repo)
  }

  async find(options?: FindManyOptions<SubscriberEntity>): Promise<SubscriberEntity[]> {
    return this.repo.find(options)
  }

  async findByEmail(email: string, storeId: string): Promise<SubscriberEntity | null> {
    return this.repo.findOne({ where: { email: email.trim().toLowerCase(), storeId } })
  }

  async findByConfirmationToken(token: string): Promise<SubscriberEntity | null> {
    return this.repo.findOne({ where: { confirmationToken: token } })
  }

  async findByUnsubscribeToken(token: string): Promise<SubscriberEntity | null> {
    return this.repo.findOne({ where: { unsubscribeToken: token } })
  }

  async save(entity: SubscriberEntity): Promise<SubscriberEntity> {
    return this.repo.save(entity)
  }

  async remove(entity: SubscriberEntity): Promise<void> {
    await this.repo.remove(entity)
  }

  async createAndSave(dto: any, ctx: RequestContextDto): Promise<SubscriberEntity> {
    const subscriber = this.repo.create({
      ...dto,
      email: typeof dto.email === 'string' ? dto.email.trim().toLowerCase() : dto.email,
      storeId: ctx.storeId,
      userId: ctx.userId,
    } as SubscriberEntity)
    return this.repo.save(subscriber)
  }

  async findAllWithFilters(
    filterDto: any,
    storeId?: string,
  ): Promise<{ subscribers: SubscriberEntity[]; total: number }> {
    const { page = 1, limit = 10, search } = filterDto
    const query = this.repo.createQueryBuilder('subscriber')

    if (storeId) {
      query.andWhere('subscriber.storeId = :storeId', { storeId })
    }

    if (search) {
      query.andWhere('subscriber.email ILIKE :search', { search: `%${search}%` })
    }

    const [subscribers, total] = await query
      .orderBy('subscriber.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return { subscribers, total }
  }
}
