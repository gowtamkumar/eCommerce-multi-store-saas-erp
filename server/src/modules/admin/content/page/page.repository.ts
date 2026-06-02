import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PageStatus } from '@/common/enums/page-status.enum'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { PageEntity } from './entities/page.entity'

@Injectable()
export class PageRepository {
  constructor(
    @InjectRepository(PageEntity)
    private readonly repo: Repository<PageEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findBySlug(
    slug: string,
    ctx: RequestContextDto,
    options?: { publishedOnly?: boolean },
  ): Promise<PageEntity | null> {
    const where: Record<string, unknown> = { slug, tenantId: ctx.tenantId }
    if (options?.publishedOnly) {
      where.status = PageStatus.PUBLISHED
    }
    return this.repo.findOne({ where: where as any })
  }

  async findById(id: string, ctx: RequestContextDto): Promise<PageEntity | null> {
    return this.repo.findOne({ where: { id, tenantId: ctx.tenantId } })
  }

  async findHomePage(
    ctx: RequestContextDto,
    options?: { publishedOnly?: boolean },
  ): Promise<PageEntity | null> {
    const where: Record<string, unknown> = { isHomePage: true, tenantId: ctx.tenantId }
    if (options?.publishedOnly) {
      where.status = PageStatus.PUBLISHED
    }
    return this.repo.findOne({ where: where as any })
  }

  async findAllWithStatus(
    ctx: RequestContextDto,
    status?: string,
    options?: { publishedOnly?: boolean },
  ): Promise<PageEntity[]> {
    const tenantId = ctx.tenantId
    const where: Record<string, unknown> = { tenantId }
    if (options?.publishedOnly) {
      where.status = PageStatus.PUBLISHED
    } else if (status) {
      where.status = status
    }
    return this.repo.find({
      select: {
        id: true,
        title: true,
        slug: true,
        isHomePage: true,
        status: true,
        order: true,
        publishAt: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
      where: where as any,
      order: { order: 'ASC', createdAt: 'DESC' },
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

  async createAndSave(dto: Partial<PageEntity>, ctx: RequestContextDto): Promise<PageEntity> {
    const tenantId = ctx.tenantId
    const userId = ctx.userId
    const page = this.repo.create({ ...dto, tenantId, userId } as PageEntity)
    return this.repo.save(page)
  }

  async updateAndSave(page: PageEntity, dto: Partial<PageEntity>): Promise<PageEntity> {
    Object.assign(page, dto)
    return this.repo.save(page)
  }

  /** Unset other home pages and save this page in one transaction. */
  async setHomePageTransactional(page: PageEntity, dto: Partial<PageEntity>): Promise<PageEntity> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(PageEntity)
      await repo.update(
        { tenantId: page.tenantId, isHomePage: true },
        { isHomePage: false },
      )
      Object.assign(page, dto, { isHomePage: true })
      return repo.save(page)
    })
  }

  async removePage(page: PageEntity): Promise<void> {
    await this.repo.softRemove(page)
  }

  /** Pages with scheduled publish times in the past that still need publishing. */
  async findScheduledDue(now: Date, tenantId?: string): Promise<PageEntity[]> {
    const qb = this.repo
      .createQueryBuilder('p')
      .where('p.status = :status', { status: PageStatus.SCHEDULED })
      .andWhere('p.publishAt IS NOT NULL')
      .andWhere('p.publishAt <= :now', { now })
    if (tenantId) qb.andWhere('p.tenantId = :tenantId', { tenantId })
    return qb.getMany()
  }
}
