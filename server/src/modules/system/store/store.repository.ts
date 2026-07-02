import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { StoreEntity } from './entities/store.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { RequestContextDto } from '@/common/dto/request-context.dto'

import { StoreDomainEntity } from './entities/store-domain.entity'

@Injectable()
export class StoreRepository extends BaseStoreRepository<StoreEntity> {
  constructor(
    @InjectRepository(StoreEntity)
    repo: Repository<StoreEntity>,
  ) {
    super(StoreEntity, repo)
}

  /**
   * Find a store by ID
   */
  async findById(id: string): Promise<StoreEntity | null> {
    return await this.repo.findOne({ where: { id } })
  }

  async findByIdWithRelations(id: string): Promise<StoreEntity | null> {
    return await this.repo.findOne({
      where: { id },
      relations: {
        activeSubscription: {
          subscriptionPlan: true,
        },
        domains: true,
      },
    })
  }

  async findByIdWithUser(id: string): Promise<StoreEntity | null> {
    return await this.repo.findOne({
      where: { id },
      relations: {
        user: true,
        activeSubscription: {
          subscriptionPlan: true,
        },
      },
    })
  }

  async findBySubdomain(subdomain: string): Promise<StoreEntity | null> {
    return await this.repo.findOne({
      where: { subdomain },
      relations: {
        domains: true,
        activeSubscription: {
          subscriptionPlan: true,
        },
      },
    })
  }

  async findByCustomDomain(customDomain: string): Promise<StoreEntity | null> {
    const domainRecord = await this.repo.manager.getRepository(StoreDomainEntity).findOne({
      where: { hostname: customDomain },
      relations: {
        store: {
          domains: true,
          activeSubscription: {
            subscriptionPlan: true,
          },
        },
      },
    })
    return domainRecord ? domainRecord.store : null
  }

  async findAllSorted(): Promise<StoreEntity[]> {
    return await this.repo.find({
      order: { createdAt: 'DESC' },
      relations: {
        activeSubscription: {
          subscriptionPlan: true,
        },
        domains: true,
      },
    })
  }

  /**
   * Efficiently fetch store counts grouped by status in a single query
   */
  async getStoreStats(): Promise<Record<string, number>> {
    const stats = await this.repo
      .createQueryBuilder('store')
      .select('store.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('store.status')
      .getRawMany()

    const result = {
      total: 0,
      active: 0,
      suspended: 0,
      archived: 0,
    }

    stats.forEach((stat) => {
      const count = parseInt(stat.count, 10)
      result[stat.status] = count
      result.total += count
    })

    return result
  }

  async findCountByStatus(status?: string): Promise<number> {
    if (!status) return await this.repo.count()
    return await this.repo.count({
      where: { status: status as any },
    })
  }

  async createAndSave(
    dto: Partial<StoreEntity>,
    ctx: RequestContextDto,
    subscriptionPlan?: any,
  ): Promise<StoreEntity> {
    const store = this.repo.create({
      ...dto,
      userId: ctx.userId,
      subscriptionPlan,
    })
    return await this.repo.save(store)
  }

  async updateAndSave(store: StoreEntity, dto: Partial<StoreEntity>): Promise<StoreEntity> {
    Object.assign(store, dto)
    return await this.repo.save(store)
  }
}
