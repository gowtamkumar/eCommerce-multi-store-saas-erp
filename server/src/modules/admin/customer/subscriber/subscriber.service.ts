import { ConflictException, Injectable, Logger } from '@nestjs/common'
import { CreateSubscriberDto } from './dto/subscriber.dto'
import { SubscriberRepository } from './subscriber.repository'
import { SubscriberEntity } from './entities/subscriber.entity'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class SubscriberService {
  private readonly logger = new Logger(SubscriberService.name)

  constructor(
    private readonly subscriberRepository: SubscriberRepository,
    private readonly cache: CacheService,
  ) {}

  async createSubscriber(createSubscriberDto: CreateSubscriberDto, ctx: RequestContextDto): Promise<SubscriberEntity> {
    this.logger.log(`${this.createSubscriber.name} Service Called`)
    const tenantId = ctx.tenantId
    const existingSubscriber = await this.subscriberRepository.findByEmail(
      createSubscriberDto.email,
      tenantId
    )

    if (existingSubscriber) {
      throw new ConflictException('Email is already subscribed to this store')
    }

    const subscriber = await this.subscriberRepository.createAndSave({
      ...createSubscriberDto,
      tenantId
    })
    
    await this.cache.delCache('subscribers:list', tenantId)
    return subscriber
  }

  async findAllSubscribers(filterDto: any, ctx: RequestContextDto): Promise<{ subscribers: SubscriberEntity[]; total: number }> {
    this.logger.log(`${this.findAllSubscribers.name} Service Called`)
    const tenantId = ctx.tenantId
    const { page = 1, limit = 10, search = '' } = filterDto || {}
    const cacheKey = `subscribers:list:p${page}:l${limit}:q${search}`

    return this.cache.rememberCache(
      cacheKey,
      () => this.subscriberRepository.findAllWithFilters(filterDto || {}, tenantId),
      300, // 5 min
      tenantId || 'global',
    )
  }
}
