import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { PageEntity } from './entities/page.entity'

@Injectable()
export class PageRepository extends Repository<PageEntity> {
  constructor(private dataSource: DataSource) {
    super(PageEntity, dataSource.createEntityManager())
  }

  async findBySlug(slug: string, tenantId: string): Promise<PageEntity | null> {
    return this.findOne({ where: { slug, tenantId } })
  }

  async findById(id: string, tenantId: string): Promise<PageEntity | null> {
    return this.findOne({ where: { id, tenantId } })
  }

  async findHomePage(tenantId: string): Promise<PageEntity | null> {
    return this.findOne({ where: { isHomePage: true, tenantId } })
  }

  async findAllWithStatus(tenantId: string, status?: string): Promise<PageEntity[]> {
    const where: any = { tenantId }
    if (status) {
      where.status = status
    }
    return this.find({
      where,
      order: { createdAt: 'DESC' },
    })
  }

  async findAllCrossTenant(): Promise<PageEntity[]> {
    return this.find()
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.count({ where: { tenantId } })
  }

  async unsetHomePage(tenantId: string): Promise<void> {
    await this.update({ tenantId, isHomePage: true }, { isHomePage: false })
  }

  async createAndSave(dto: any, tenantId: string): Promise<PageEntity> {
    const page = this.create({ ...dto, tenantId } as PageEntity)
    return this.save(page)
  }

  async updateAndSave(page: PageEntity, dto: any): Promise<PageEntity> {
    Object.assign(page, dto)
    return this.save(page)
  }

  async removePage(page: PageEntity): Promise<void> {
    await this.softRemove(page)
  }
}
