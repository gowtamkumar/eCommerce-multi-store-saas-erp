import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { TenantEntity } from './entities/tenant.entity'

@Injectable()
export class TenantRepository extends Repository<TenantEntity> {
  constructor(private dataSource: DataSource) {
    super(TenantEntity, dataSource.createEntityManager())
  }

  async findTenantById(id: string): Promise<TenantEntity | null> {
    return await this.findOne({ where: { id } })
  }

  async findById(id: string): Promise<TenantEntity | null> {
    return await this.findTenantById(id)
  }

  async findByIdWithRelations(id: string): Promise<TenantEntity | null> {
    return await this.findOne({
      where: { id },
      relations: ['subscriptionPlan'],
    })
  }

  async findByIdWithUser(id: string): Promise<TenantEntity | null> {
    return await this.findOne({
      where: { id },
      relations: ['user'],
    })
  }

  async findBySubdomain(subdomain: string): Promise<TenantEntity | null> {
    return await this.findOne({ where: { subdomain } })
  }

  async findByCustomDomain(customDomain: string): Promise<TenantEntity | null> {
    return await this.findOne({ where: { customDomain } })
  }

  async findAllSorted(): Promise<TenantEntity[]> {
    return await this.find({
      order: { createdAt: 'DESC' },
    })
  }

  async findCountByStatus(status?: string): Promise<number> {
    if (!status) return await this.count()
    return await this.count({
      where: { status: status as any },
    })
  }

  async createAndSave(dto: any, subscriptionPlan?: any): Promise<TenantEntity> {
    const tenant = this.create({
      ...dto,
      subscriptionPlan,
    } as any) as unknown as TenantEntity
    return await (this.save(tenant) as Promise<TenantEntity>)
  }

  async updateAndSave(tenant: TenantEntity, dto: any): Promise<TenantEntity> {
    Object.assign(tenant, dto)
    return await this.save(tenant)
  }
}
