import { BaseStoreRepository } from '@/common/base-repository'
import { FaqStatus } from '@/common/enums/faq-status.enum'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, IsNull, Repository } from 'typeorm'
import { FaqEntity } from './entities/faq.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class FaqRepository extends BaseStoreRepository<FaqEntity> {
  constructor(
    @InjectRepository(FaqEntity)
    repo: Repository<FaqEntity>,
  ) {
    super(FaqEntity, repo)
  }

  async findAllWithFilters(
    filterDto: any,
    storeId: string,
  ): Promise<{ faqs: FaqEntity[]; total: number }> {
    const { page, limit, q, status } = filterDto
    const query = this.repo
      .createQueryBuilder('faq')
      .where('faq.storeId = :storeId', { storeId })

    if (status) {
      query.andWhere('faq.status = :status', { status })
    }

    if (q) {
      query.andWhere('(faq.question ILIKE :q OR faq.answer ILIKE :q)', { q: `%${q}%` })
    }

    const [faqs, total] = await query
      .orderBy('faq.order', 'ASC')
      .addOrderBy('faq.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return { faqs, total }
  }

  async findById(id: string, storeId: string): Promise<FaqEntity | null> {
    return this.repo.findOne({ where: { id, storeId } })
  }

  async findByPageId(pageId: string, storeId: string): Promise<FaqEntity[]> {
    return this.repo.find({
      where: { pageId, storeId, status: FaqStatus.ACTIVE },
      order: { order: 'ASC', createdAt: 'DESC' },
    })
  }

  async findGlobal(storeId: string): Promise<FaqEntity[]> {
    return this.repo.find({
      where: {
        storeId,
        productId: IsNull(),
        pageId: IsNull(),
        status: FaqStatus.ACTIVE,
      },
      order: { order: 'ASC', createdAt: 'DESC' },
    })
  }

  async findByIdsList(ids: string[], storeId: string): Promise<FaqEntity[]> {
    if (!ids || ids.length === 0) return []
    return this.repo.find({
      where: {
        id: In(ids),
        storeId,
        status: FaqStatus.ACTIVE,
      },
      order: { order: 'ASC', createdAt: 'DESC' },
    })
  }

  async createAndSave(dto: any, ctx: RequestContextDto): Promise<FaqEntity> {
    const faq = this.repo.create({
      ...dto,
      storeId: ctx.storeId,
      userId: ctx.userId,
    } as FaqEntity)
    return this.repo.save(faq)
  }

  async updateAndSave(faq: FaqEntity, dto: any): Promise<FaqEntity> {
    Object.assign(faq, dto)
    return this.repo.save(faq)
  }

  async removeFaq(faq: FaqEntity): Promise<void> {
    await this.repo.softRemove(faq)
  }

  async saveMultiple(
    faqs: any[],
    productId: string,
    ctx: RequestContextDto,
    manager?: any,
  ): Promise<FaqEntity[]> {
    if (!faqs || faqs.length === 0) return []
    const repo = this.txRepo(manager)
    const entities = faqs.map((faq) =>
      repo.create({ ...faq, productId, storeId: ctx.storeId, userId: ctx.userId } as FaqEntity),
    )
    return repo.save(entities)
  }

  async deleteByProductId(productId: string, storeId: string, manager?: any): Promise<void> {
    const repo = this.txRepo(manager)
    await repo.softDelete({ productId, storeId })
  }
}
