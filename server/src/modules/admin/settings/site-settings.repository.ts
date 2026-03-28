import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { SiteSettingsEntity } from './entities/site-settings.entity'

@Injectable()
export class SiteSettingsRepository extends Repository<SiteSettingsEntity> {
  constructor(private dataSource: DataSource) {
    super(SiteSettingsEntity, dataSource.createEntityManager())
  }

  async findByTenantId(tenantId: string): Promise<SiteSettingsEntity | null> {
    return await this.findOne({ where: { tenantId } })
  }

  async createAndSave(dto: any, tenantId: string): Promise<SiteSettingsEntity> {
    const settings = this.create({ ...dto, tenantId } as any) as unknown as SiteSettingsEntity
    return await (this.save(settings) as Promise<SiteSettingsEntity>)
  }

  async updateAndSave(settings: SiteSettingsEntity, dto: any): Promise<SiteSettingsEntity> {
    Object.assign(settings, dto)
    return await this.save(settings)
  }
}
