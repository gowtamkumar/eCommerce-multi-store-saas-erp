import { BaseTenantRepository } from '@/common/base-repository'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PageReusableBlockEntity } from './entities/page-reusable-block.entity'

@Injectable()
export class PageReusableBlockRepository extends BaseTenantRepository<PageReusableBlockEntity> {
  constructor(
    @InjectRepository(PageReusableBlockEntity)
    repo: Repository<PageReusableBlockEntity>,
  ) {
    super(PageReusableBlockEntity, repo)
}

  async create(
    payload: Partial<PageReusableBlockEntity>,
    ctx: RequestContextDto,
  ): Promise<PageReusableBlockEntity> {
    const block = this.repo.create({
      ...payload,
      tenantId: ctx.tenantId,
      userId: ctx.userId ?? null,
    } as PageReusableBlockEntity)
    return this.repo.save(block)
  }

  async list(ctx: RequestContextDto): Promise<PageReusableBlockEntity[]> {
    return this.repo.find({
      where: { tenantId: ctx.tenantId },
      order: { createdAt: 'DESC' },
    })
  }

  async findOne(id: string, ctx: RequestContextDto): Promise<PageReusableBlockEntity | null> {
    return this.repo.findOne({ where: { id, tenantId: ctx.tenantId } })
  }

  async update(
    id: string,
    payload: Partial<PageReusableBlockEntity>,
    ctx: RequestContextDto,
  ): Promise<PageReusableBlockEntity | null> {
    const block = await this.findOne(id, ctx)
    if (!block) return null
    Object.assign(block, payload)
    return this.repo.save(block)
  }

  async remove(id: string, ctx: RequestContextDto): Promise<boolean> {
    const block = await this.findOne(id, ctx)
    if (!block) return false
    await this.repo.softRemove(block)
    return true
  }
}
