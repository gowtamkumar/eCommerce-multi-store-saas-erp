import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { QuotationEntity, QuotationStatus } from '../entities/quotation.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class QuotationRepository extends BaseStoreRepository<QuotationEntity> {
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
      storeId: ctx.storeId,
    } as QuotationEntity)
    return repo.save(quotation)
  }

  async findAllByRfq(rfqId: string, storeId: string): Promise<QuotationEntity[]> {
    return this.repo.find({
      where: { rfqId, storeId },
      relations: {
        supplier: true,
      },
      order: { totalAmount: 'ASC' }, // Sort by lowest bid
    })
  }

  async findById(
    id: string,
    storeId: string,
    manager?: EntityManager,
  ): Promise<QuotationEntity | null> {
    const repo = this.getRepo(manager)
    return await repo.findOne({
      where: { id, storeId },
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
