import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { TenantEntity } from './entities/tenant.entity'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class TenantRepository {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly repo: Repository<TenantEntity>,
  ) { }

  /**
   * Find a tenant by ID
   */
  async findById(id: string): Promise<TenantEntity | null> {
    return await this.repo.findOne({ where: { id } })
  }

  async findByIdWithRelations(id: string): Promise<TenantEntity | null> {
    return await this.repo.findOne({
      where: { id },
      relations: ['subscriptionPlan'],
    })
  }

  async findByIdWithUser(id: string): Promise<TenantEntity | null> {
    return await this.repo.findOne({
      where: { id },
      relations: ['user'],
    })
  }

  async findBySubdomain(subdomain: string): Promise<TenantEntity | null> {
    return await this.repo.findOne({ where: { subdomain } })
  }

  async findByCustomDomain(customDomain: string): Promise<TenantEntity | null> {
    return await this.repo.findOne({ where: { customDomain } })
  }

  async findAllSorted(): Promise<TenantEntity[]> {
    return await this.repo.find({
      order: { createdAt: 'DESC' },
      relations: ['subscriptionPlan'],
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
    userId?: string,
    subscriptionPlan?: any,
  ): Promise<TenantEntity> {
    const tenant = this.repo.create({
      ...dto,
      userId,
      subscriptionPlan,
    })
    return await this.repo.save(tenant)
  }

  async updateAndSave(
    tenant: TenantEntity,
    dto: Partial<TenantEntity>,
  ): Promise<TenantEntity> {
    Object.assign(tenant, dto)
    return await this.repo.save(tenant)
  }
}
