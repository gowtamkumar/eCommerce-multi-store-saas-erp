import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SiteSettingsEntity } from './entities/site-settings.entity'

@Injectable()
export class SiteSettingsRepository {
  constructor(
    @InjectRepository(SiteSettingsEntity)
    private readonly repo: Repository<SiteSettingsEntity>,
  ) { }

  async findByTenantId(tenantId: string): Promise<SiteSettingsEntity | null> {
    return await this.repo.findOne({ where: { tenantId } })
  }

  async createAndSave(dto: any, tenantId: string, userId?: string): Promise<SiteSettingsEntity> {
    const settings = this.repo.create({ ...dto, tenantId, userId } as any) as unknown as SiteSettingsEntity
    return this.repo.save(settings)
  }

  async updateAndSave(settings: SiteSettingsEntity, dto: any): Promise<SiteSettingsEntity> {
    Object.assign(settings, dto)
    return await this.repo.save(settings)
  }

}
