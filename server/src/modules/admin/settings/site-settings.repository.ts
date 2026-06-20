import { BaseTenantRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
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

  async findByTenantId(tenantId: string, manager?: EntityManager): Promise<SiteSettingsEntity | null> {
    return await this.txRepo(manager).findOne({ where: { tenantId } })
  }

  async createAndSave(
    dto: any,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<SiteSettingsEntity> {
    const settings = this.txRepo(manager).create({
      ...dto,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
    } as any) as unknown as SiteSettingsEntity
    return this.txRepo(manager).save(settings)
  }

  async updateAndSave(
    settings: SiteSettingsEntity,
    dto: any,
    manager?: EntityManager,
  ): Promise<SiteSettingsEntity> {
    Object.assign(settings, dto)
    return await this.txRepo(manager).save(settings)
  }
}
