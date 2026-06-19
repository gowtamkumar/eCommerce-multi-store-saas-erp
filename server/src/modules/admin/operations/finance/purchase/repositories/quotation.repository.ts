import { BaseTenantRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { QuotationEntity, QuotationStatus } from '../entities/quotation.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class QuotationRepository extends BaseTenantRepository<QuotationEntity> {
  constructor(
    @InjectRepository(QuotationEntity)
    repo: Repository<QuotationEntity>,
  ) {
    super(QuotationEntity, repo)
}

  private getRepo(manager?: EntityManager): Repository<QuotationEntity> {
    return this.txRepo(manager)
  }

  async createAndSave(
    data: Partial<QuotationEntity>,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<QuotationEntity> {
    const repo = this.getRepo(manager)
    const quotation = repo.create({
      ...data,
      tenantId: ctx.tenantId,
    } as QuotationEntity)
    return repo.save(quotation)
  }

  async findAllByRfq(rfqId: string, tenantId: string): Promise<QuotationEntity[]> {
    return this.repo.find({
      where: { rfqId, tenantId },
      relations: {
        supplier: true,
      },
      order: { totalAmount: 'ASC' }, // Sort by lowest bid
    })
  }

  async findById(
    id: string,
    tenantId: string,
    manager?: EntityManager,
  ): Promise<QuotationEntity | null> {
    const repo = this.getRepo(manager)
    return await repo.findOne({
      where: { id, tenantId },
      relations: {
        rfq: true,
        supplier: true,
      },
    })
  }

  async saveQuotation(
    quotation: QuotationEntity,
    manager?: EntityManager,
  ): Promise<QuotationEntity> {
    const repo = this.getRepo(manager)
    return await repo.save(quotation)
  }
}
