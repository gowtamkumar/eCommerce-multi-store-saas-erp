import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PageEntity } from './entities/page.entity'

@Injectable()
export class PageRepository {
  constructor(
    @InjectRepository(PageEntity)
    private readonly repo: Repository<PageEntity>,
  ) { }

  async findBySlug(slug: string, tenantId: string): Promise<PageEntity | null> {
    return this.repo.findOne({ where: { slug, tenantId } })
  }

  async findById(id: string, tenantId: string): Promise<PageEntity | null> {
    return this.repo.findOne({ where: { id, tenantId } })
  }

  async findHomePage(tenantId: string): Promise<PageEntity | null> {
    return this.repo.findOne({ where: { isHomePage: true, tenantId } })
  }

  async findAllWithStatus(tenantId: string, status?: string): Promise<PageEntity[]> {
    const where: any = { tenantId }
    if (status) {
      where.status = status
    }
    return this.repo.find({
      select: {
        id: true,
        title: true,
        slug: true,
        isHomePage: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
      where,
      order: { createdAt: 'DESC' },
    })
  }

  async findAllCrossTenant(): Promise<PageEntity[]> {
    return this.repo.find()
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.repo.count({ where: { tenantId } })
  }

  async unsetHomePage(tenantId: string): Promise<void> {
    await this.repo.update({ tenantId, isHomePage: true }, { isHomePage: false })
  }

  async createAndSave(dto: any, tenantId: string): Promise<PageEntity> {
    const page = this.repo.create({ ...dto, tenantId } as PageEntity)
    return this.repo.save(page)
  }

  async updateAndSave(page: PageEntity, dto: any): Promise<PageEntity> {
    Object.assign(page, dto)
    return this.repo.save(page)
  }

  async removePage(page: PageEntity): Promise<void> {
    await this.repo.softRemove(page)
  }

}
