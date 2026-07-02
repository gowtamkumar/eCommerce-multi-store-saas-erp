import { BaseStoreRepository } from '@/common/base-repository'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PageRevisionEntity } from './entities/page-revision.entity'

const MAX_REVISIONS_PER_PAGE = 30

@Injectable()
export class PageRevisionRepository extends BaseStoreRepository<PageRevisionEntity> {
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
      storeId: ctx.storeId,
      createdById: ctx.userId ?? null,
    } as PageRevisionEntity)
    const saved = await this.repo.save(revision)
    await this.pruneOlderThanLimit(payload.pageId!, ctx.storeId)
    return saved
  }

  async list(pageId: string, ctx: RequestContextDto): Promise<PageRevisionEntity[]> {
    return this.repo.find({
      where: { pageId, storeId: ctx.storeId },
      order: { createdAt: 'DESC' },
      take: MAX_REVISIONS_PER_PAGE,
    })
  }

  async findOne(id: string, ctx: RequestContextDto): Promise<PageRevisionEntity | null> {
    return this.repo.findOne({ where: { id, storeId: ctx.storeId } })
  }

  /** Keep only the most recent N snapshots for a given page. */
  private async pruneOlderThanLimit(pageId: string, storeId: string): Promise<void> {
    const ids = await this.repo
      .createQueryBuilder('r')
      .select('r.id')
      .where('r.pageId = :pageId AND r.storeId = :storeId', { pageId, storeId })
      .orderBy('r.createdAt', 'DESC')
      .skip(MAX_REVISIONS_PER_PAGE)
      .take(1000)
      .getMany()
    if (!ids.length) return
    await this.repo.delete(ids.map((r) => r.id))
  }
}
