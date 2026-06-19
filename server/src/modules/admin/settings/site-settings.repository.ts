import { BaseTenantRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SiteSettingsEntity } from './entities/site-settings.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class SiteSettingsRepository extends BaseTenantRepository<SiteSettingsEntity> {
  constructor(
    @InjectRepository(SiteSettingsEntity)
    repo: Repository<SiteSettingsEntity>,
  ) {
    super(SiteSettingsEntity, repo)
}

  async findByTenantId(tenantId: string): Promise<SiteSettingsEntity | null> {
    return await this.repo.findOne({ where: { tenantId } })
  }

  async createAndSave(dto: any, ctx: RequestContextDto): Promise<SiteSettingsEntity> {
    const settings = this.repo.create({
      ...dto,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
    } as any) as unknown as SiteSettingsEntity
    return this.repo.save(settings)
  }

  async updateAndSave(settings: SiteSettingsEntity, dto: any): Promise<SiteSettingsEntity> {
    Object.assign(settings, dto)
    return await this.repo.save(settings)
  }
}
