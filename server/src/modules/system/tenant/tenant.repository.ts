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

  async findBySubdomain(subdomain: string): Promise<TenantEntity | null> {
    return await this.findOne({ where: { subdomain } })
  }
}
