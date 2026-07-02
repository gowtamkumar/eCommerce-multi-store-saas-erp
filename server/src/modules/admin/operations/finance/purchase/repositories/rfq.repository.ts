import { BaseStoreRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { RfqEntity, RFQStatus } from '../entities/rfq.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class RfqRepository extends BaseStoreRepository<RfqEntity> {
  constructor(
    @InjectRepository(RfqEntity)
    repo: Repository<RfqEntity>,
  ) {
    super(RfqEntity, repo)
}

  private getRepo(manager?: EntityManager): Repository<RfqEntity> {
    return this.txRepo(manager)
  }

  async generateRFQNumber(storeId: string, manager?: EntityManager): Promise<string> {
    const repo = this.getRepo(manager)
    const count = await repo.count({ where: { storeId } })
    return `RFQ-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`
  }

  async createAndSave(
    data: Partial<RfqEntity>,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<RfqEntity> {
    const repo = this.getRepo(manager)
    const rfqNumber = await this.generateRFQNumber(ctx.storeId, manager)
    const rfq = repo.create({
      ...data,
      rfqNumber,
      storeId: ctx.storeId,
      createdById: ctx.userId,
    } as RfqEntity)
    return repo.save(rfq)
  }

  async findAllByStore(
    storeId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: RFQStatus,
  ): Promise<[RfqEntity[], number]> {
    const qb = this.repo
      .createQueryBuilder('rfq')
      .leftJoinAndSelect('rfq.purchaseRequisition', 'purchaseRequisition')
      .leftJoinAndSelect('rfq.createdBy', 'createdBy')
      .leftJoinAndSelect('rfq.quotations', 'quotations')
      .leftJoinAndSelect('quotations.supplier', 'supplier')
      .where('rfq.storeId = :storeId', { storeId })
      .orderBy('rfq.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    if (search) {
      qb.andWhere('rfq.rfqNumber ILIKE :search', { search: `%${search}%` })
    }

    if (status) {
      qb.andWhere('rfq.status = :status', { status })
    }

    return await qb.getManyAndCount()
  }

  async findByIdWithRelations(
    id: string,
    storeId: string,
    manager?: EntityManager,
  ): Promise<RfqEntity | null> {
    const repo = this.getRepo(manager)
    return await repo.findOne({
      where: { id, storeId },
      relations: {
        purchaseRequisition: {
          items: true,
        },
        createdBy: true,
        quotations: {
          supplier: true,
        },
      },
    })
  }

  async findById(id: string, storeId: string, manager?: EntityManager): Promise<RfqEntity | null> {
    const repo = this.getRepo(manager)
    return await repo.findOne({
      where: { id, storeId },
    })
  }

  async saveRfq(rfq: RfqEntity, manager?: EntityManager): Promise<RfqEntity> {
    const repo = this.getRepo(manager)
    return await repo.save(rfq)
  }
}
