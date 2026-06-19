import { BaseTenantRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { TenantEntity } from './entities/tenant.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { RequestContextDto } from '@/common/dto/request-context.dto'

import { TenantDomainEntity } from './entities/tenant-domain.entity'

@Injectable()
export class TenantRepository extends BaseTenantRepository<TenantEntity> {
  constructor(
    @InjectRepository(TenantEntity)
    repo: Repository<TenantEntity>,
  ) {
    super(TenantEntity, repo)
}

  /**
   * Find a tenant by ID
   */
  async findById(id: string): Promise<TenantEntity | null> {
    return await this.repo.findOne({ where: { id } })
  }

  async findByIdWithRelations(id: string): Promise<TenantEntity | null> {
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

  async findByIdWithUser(id: string): Promise<TenantEntity | null> {
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

  async findBySubdomain(subdomain: string): Promise<TenantEntity | null> {
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

  async findByCustomDomain(customDomain: string): Promise<TenantEntity | null> {
    const domainRecord = await this.repo.manager.getRepository(TenantDomainEntity).findOne({
      where: { hostname: customDomain },
      relations: {
        tenant: {
          domains: true,
          activeSubscription: {
            subscriptionPlan: true,
          },
        },
      },
    })
    return domainRecord ? domainRecord.tenant : null
  }

  async findAllSorted(): Promise<TenantEntity[]> {
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
   * Efficiently fetch tenant counts grouped by status in a single query
   */
  async getTenantStats(): Promise<Record<string, number>> {
    const stats = await this.repo
      .createQueryBuilder('tenant')
      .select('tenant.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('tenant.status')
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
    dto: Partial<TenantEntity>,
    ctx: RequestContextDto,
    subscriptionPlan?: any,
  ): Promise<TenantEntity> {
    const tenant = this.repo.create({
      ...dto,
      userId: ctx.userId,
      subscriptionPlan,
    })
    return await this.repo.save(tenant)
  }

  async updateAndSave(tenant: TenantEntity, dto: Partial<TenantEntity>): Promise<TenantEntity> {
    Object.assign(tenant, dto)
    return await this.repo.save(tenant)
  }
}
