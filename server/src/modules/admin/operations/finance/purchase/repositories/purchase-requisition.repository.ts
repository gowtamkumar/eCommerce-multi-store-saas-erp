import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { PurchaseRequisitionEntity, PRStatus } from '../entities/purchase-requisition.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class PurchaseRequisitionRepository {
  constructor(
    @InjectRepository(PurchaseRequisitionEntity)
    private readonly repo: Repository<PurchaseRequisitionEntity>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<PurchaseRequisitionEntity> {
    return manager ? manager.getRepository(PurchaseRequisitionEntity) : this.repo
  }

  async generatePRNumber(tenantId: string, manager?: EntityManager): Promise<string> {
    const repo = this.getRepo(manager)
    const count = await repo.count({ where: { tenantId } })
    return `PR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`
  }

  async createAndSave(
    data: Partial<PurchaseRequisitionEntity>,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<PurchaseRequisitionEntity> {
    const repo = this.getRepo(manager)
    const prNumber = await this.generatePRNumber(ctx.tenantId, manager)
    const pr = repo.create({
      ...data,
      prNumber,
      tenantId: ctx.tenantId,
      requestedById: ctx.userId,
    } as PurchaseRequisitionEntity)
    return repo.save(pr)
  }

  async findAllByTenant(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: PRStatus,
  ): Promise<[PurchaseRequisitionEntity[], number]> {
    const qb = this.repo
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.requestedBy', 'requestedBy')
      .leftJoinAndSelect('pr.approvedBy', 'approvedBy')
      .leftJoinAndSelect('pr.branch', 'branch')
      .leftJoinAndSelect('pr.warehouse', 'warehouse')
      .where('pr.tenantId = :tenantId', { tenantId })
      .orderBy('pr.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    if (search) {
      qb.andWhere('(pr.prNumber ILIKE :search OR pr.justification ILIKE :search)', {
        search: `%${search}%`,
      })
    }

    if (status) {
      qb.andWhere('pr.status = :status', { status })
    }

    return await qb.getManyAndCount()
  }

  async findByIdWithRelations(
    id: string,
    tenantId: string,
    manager?: EntityManager,
  ): Promise<PurchaseRequisitionEntity | null> {
    const repo = this.getRepo(manager)
    return await repo.findOne({
      where: { id, tenantId },
      relations: ['requestedBy', 'approvedBy', 'branch', 'warehouse', 'items', 'items.product'],
    })
  }

  async findById(
    id: string,
    tenantId: string,
    manager?: EntityManager,
  ): Promise<PurchaseRequisitionEntity | null> {
    const repo = this.getRepo(manager)
    return await repo.findOne({
      where: { id, tenantId },
    })
  }

  async savePR(pr: PurchaseRequisitionEntity, manager?: EntityManager): Promise<PurchaseRequisitionEntity> {
    const repo = this.getRepo(manager)
    return await repo.save(pr)
  }
}
