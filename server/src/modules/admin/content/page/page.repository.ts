import { RequestContextDto } from '@/common/dto/request-context.dto'
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

  async findBySlug(slug: string, ctx: RequestContextDto): Promise<PageEntity | null> {
    return this.repo.findOne({ where: { slug, tenantId: ctx.tenantId } })
  }

  async findById(id: string, ctx: RequestContextDto): Promise<PageEntity | null> {
    return this.repo.findOne({ where: { id, tenantId: ctx.tenantId } })
  }

  async findHomePage(ctx: RequestContextDto): Promise<PageEntity | null> {
    return this.repo.findOne({ where: { isHomePage: true, tenantId: ctx.tenantId } })
  }

  async findAllWithStatus(ctx: RequestContextDto, status?: string): Promise<PageEntity[]> {
    const tenantId = ctx.tenantId
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

  async countByTenant(ctx: RequestContextDto): Promise<number> {
    return this.repo.count({ where: { tenantId: ctx.tenantId } })
  }

  async unsetHomePage(ctx: RequestContextDto): Promise<void> {
    await this.repo.update({ tenantId: ctx.tenantId, isHomePage: true }, { isHomePage: false })
  }

  async createAndSave(dto: any, ctx: RequestContextDto): Promise<PageEntity> {
    const tenantId = ctx.tenantId
    const userId = ctx.userId
    const page = this.repo.create({ ...dto, tenantId, userId } as PageEntity)
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
