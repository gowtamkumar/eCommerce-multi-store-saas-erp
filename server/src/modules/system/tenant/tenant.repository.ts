import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { TenantEntity } from './entities/tenant.entity'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class TenantRepository {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
  ) { }

  async findTenantById(id: string): Promise<TenantEntity | null> {
    return await this.tenantRepo.findOne({ where: { id } })
  }

  async findById(id: string): Promise<TenantEntity | null> {
    return await this.findTenantById(id)
  }

  async findByIdWithRelations(id: string): Promise<TenantEntity | null> {
    return await this.tenantRepo.findOne({
      where: { id },
      relations: ['subscriptionPlan'],
    })
  }

  async findByIdWithUser(id: string): Promise<TenantEntity | null> {
    return await this.tenantRepo.findOne({
      where: { id },
      relations: ['user'],
    })
  }

  async findBySubdomain(subdomain: string): Promise<TenantEntity | null> {
    return await this.tenantRepo.findOne({ where: { subdomain } })
  }

  async findByCustomDomain(customDomain: string): Promise<TenantEntity | null> {
    return await this.tenantRepo.findOne({ where: { customDomain } })
  }

  async findAllSorted(): Promise<TenantEntity[]> {
    return await this.tenantRepo.find({
      order: { createdAt: 'DESC' },
    })
  }

  async findCountByStatus(status?: string): Promise<number> {
    if (!status) return await this.tenantRepo.count()
    return await this.tenantRepo.count({
      where: { status: status as any },
    })
  }

  async createAndSave(dto: any, subscriptionPlan?: any): Promise<TenantEntity> {
    const tenant = this.tenantRepo.create({
      ...dto,
      subscriptionPlan,
    } as any) as unknown as TenantEntity
    return await (this.tenantRepo.save(tenant) as Promise<TenantEntity>)
  }

  async updateAndSave(tenant: TenantEntity, dto: any): Promise<TenantEntity> {
    Object.assign(tenant, dto)
    return await this.tenantRepo.save(tenant)
  }
}
