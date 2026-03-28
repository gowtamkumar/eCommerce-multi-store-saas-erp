import { FaqStatus } from '@/common/enums/faq-status.enum'
import { Injectable } from '@nestjs/common'
import { DataSource, In, Repository } from 'typeorm'
import { FaqEntity } from './entities/faq.entity'

@Injectable()
export class FaqRepository extends Repository<FaqEntity> {
  constructor(private dataSource: DataSource) {
    super(FaqEntity, dataSource.createEntityManager())
  }

  async findAllWithFilters(
    filterDto: any,
    tenantId: string,
  ): Promise<{ faqs: FaqEntity[]; total: number }> {
    const { page, limit, q, status } = filterDto
    const query = this.createQueryBuilder('faq').where('faq.tenantId = :tenantId', { tenantId })

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

  async findById(id: string, tenantId: string): Promise<FaqEntity | null> {
    return this.findOne({ where: { id, tenantId } })
  }

  async findByPageId(pageId: string, tenantId: string): Promise<FaqEntity[]> {
    return this.find({
      where: { pageId, tenantId, status: FaqStatus.ACTIVE },
      order: { order: 'ASC', createdAt: 'DESC' },
    })
  }

  async findGlobal(tenantId: string): Promise<FaqEntity[]> {
    return this.find({
      where: {
        tenantId,
        productId: null,
        pageId: null,
        status: FaqStatus.ACTIVE,
      },
      order: { order: 'ASC', createdAt: 'DESC' },
    })
  }

  async findByIdsList(ids: string[], tenantId: string): Promise<FaqEntity[]> {
    if (!ids || ids.length === 0) return []
    return this.find({
      where: {
        id: In(ids),
        tenantId,
        status: FaqStatus.ACTIVE,
      },
      order: { order: 'ASC', createdAt: 'DESC' },
    })
  }

  async createAndSave(dto: any, tenantId: string): Promise<FaqEntity> {
    const faq = this.create({ ...dto, tenantId } as FaqEntity)
    return this.save(faq)
  }

  async updateAndSave(faq: FaqEntity, dto: any): Promise<FaqEntity> {
    Object.assign(faq, dto)
    return this.save(faq)
  }

  async removeFaq(faq: FaqEntity): Promise<void> {
    await this.remove(faq)
  }

  async saveMultiple(faqs: any[], productId: string, tenantId: string): Promise<FaqEntity[]> {
    if (!faqs || faqs.length === 0) return []
    const entities = faqs.map((faq) => this.create({ ...faq, productId, tenantId } as FaqEntity))
    return this.save(entities)
  }

  async deleteByProductId(productId: string, tenantId: string): Promise<void> {
    await this.delete({ productId, tenantId })
  }
}
