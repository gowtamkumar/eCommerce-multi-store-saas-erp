import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { RfqEntity, RFQStatus } from '../entities/rfq.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class RfqRepository {
  constructor(
    @InjectRepository(RfqEntity)
    private readonly repo: Repository<RfqEntity>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<RfqEntity> {
    return manager ? manager.getRepository(RfqEntity) : this.repo
  }

  async generateRFQNumber(tenantId: string, manager?: EntityManager): Promise<string> {
    const repo = this.getRepo(manager)
    const count = await repo.count({ where: { tenantId } })
    return `RFQ-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`
  }

  async createAndSave(
    data: Partial<RfqEntity>,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<RfqEntity> {
    const repo = this.getRepo(manager)
    const rfqNumber = await this.generateRFQNumber(ctx.tenantId, manager)
    const rfq = repo.create({
      ...data,
      rfqNumber,
      tenantId: ctx.tenantId,
      createdById: ctx.userId,
    } as RfqEntity)
    return repo.save(rfq)
  }

  async findAllByTenant(
    tenantId: string,
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
      .where('rfq.tenantId = :tenantId', { tenantId })
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
    tenantId: string,
    manager?: EntityManager,
  ): Promise<RfqEntity | null> {
    const repo = this.getRepo(manager)
    return await repo.findOne({
      where: { id, tenantId },
      relations: [
        'purchaseRequisition',
        'purchaseRequisition.items',
        'createdBy',
        'quotations',
        'quotations.supplier',
      ],
    })
  }

  async findById(
    id: string,
    tenantId: string,
    manager?: EntityManager,
  ): Promise<RfqEntity | null> {
    const repo = this.getRepo(manager)
    return await repo.findOne({
      where: { id, tenantId },
    })
  }

  async saveRfq(rfq: RfqEntity, manager?: EntityManager): Promise<RfqEntity> {
    const repo = this.getRepo(manager)
    return await repo.save(rfq)
  }
}
