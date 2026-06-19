import { BaseTenantRepository } from '@/common/base-repository'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { PRStatus, PurchaseRequisitionEntity } from '../entities/purchase-requisition.entity'

@Injectable()
export class PurchaseRequisitionRepository extends BaseTenantRepository<PurchaseRequisitionEntity> {
  constructor(
    @InjectRepository(PurchaseRequisitionEntity)
    repo: Repository<PurchaseRequisitionEntity>,
  ) {
    super(PurchaseRequisitionEntity, repo)
}

  private getRepo(manager?: EntityManager): Repository<PurchaseRequisitionEntity> {
    return this.txRepo(manager)
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
      // include items and product relation so list responses contain item details/counts
      .leftJoinAndSelect('pr.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
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
      relations: {
        requestedBy: true,
        approvedBy: true,
        branch: true,
        warehouse: true,
        items: {
          product: true,
        },
      },
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

  async savePR(
    pr: PurchaseRequisitionEntity,
    manager?: EntityManager,
  ): Promise<PurchaseRequisitionEntity> {
    const repo = this.getRepo(manager)
    return await repo.save(pr)
  }
}
