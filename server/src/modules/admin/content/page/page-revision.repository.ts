import { BaseTenantRepository } from '@/common/base-repository'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PageRevisionEntity } from './entities/page-revision.entity'

const MAX_REVISIONS_PER_PAGE = 30

@Injectable()
export class PageRevisionRepository extends BaseTenantRepository<PageRevisionEntity> {
  constructor(
    @InjectRepository(PageRevisionEntity)
    repo: Repository<PageRevisionEntity>,
  ) {
    super(PageRevisionEntity, repo)
}

  async createSnapshot(
    payload: Partial<PageRevisionEntity>,
    ctx: RequestContextDto,
  ): Promise<PageRevisionEntity> {
    const revision = this.repo.create({
      ...payload,
      tenantId: ctx.tenantId,
      createdById: ctx.userId ?? null,
    } as PageRevisionEntity)
    const saved = await this.repo.save(revision)
    await this.pruneOlderThanLimit(payload.pageId!, ctx.tenantId)
    return saved
  }

  async list(pageId: string, ctx: RequestContextDto): Promise<PageRevisionEntity[]> {
    return this.repo.find({
      where: { pageId, tenantId: ctx.tenantId },
      order: { createdAt: 'DESC' },
      take: MAX_REVISIONS_PER_PAGE,
    })
  }

  async findOne(id: string, ctx: RequestContextDto): Promise<PageRevisionEntity | null> {
    return this.repo.findOne({ where: { id, tenantId: ctx.tenantId } })
  }

  /** Keep only the most recent N snapshots for a given page. */
  private async pruneOlderThanLimit(pageId: string, tenantId: string): Promise<void> {
    const ids = await this.repo
      .createQueryBuilder('r')
      .select('r.id')
      .where('r.pageId = :pageId AND r.tenantId = :tenantId', { pageId, tenantId })
      .orderBy('r.createdAt', 'DESC')
      .skip(MAX_REVISIONS_PER_PAGE)
      .take(1000)
      .getMany()
    if (!ids.length) return
    await this.repo.delete(ids.map((r) => r.id))
  }
}
