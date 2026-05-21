import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { DebitNoteEntity, DebitNoteStatus } from '../entities/debit-note.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class DebitNoteRepository {
  constructor(
    @InjectRepository(DebitNoteEntity)
    private readonly repo: Repository<DebitNoteEntity>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<DebitNoteEntity> {
    return manager ? manager.getRepository(DebitNoteEntity) : this.repo
  }

  async generateDebitNoteNumber(tenantId: string, manager?: EntityManager): Promise<string> {
    const repo = this.getRepo(manager)
    const count = await repo.count({ where: { tenantId } })
    return `DN-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`
  }

  async createAndSave(
    data: Partial<DebitNoteEntity>,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<DebitNoteEntity> {
    const repo = this.getRepo(manager)
    const debitNoteNumber = await this.generateDebitNoteNumber(ctx.tenantId, manager)
    const debitNote = repo.create({
      ...data,
      debitNoteNumber,
      tenantId: ctx.tenantId,
      createdById: ctx.userId,
    } as DebitNoteEntity)
    return repo.save(debitNote)
  }

  async findAllByTenant(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: DebitNoteStatus,
  ): Promise<[DebitNoteEntity[], number]> {
    const qb = this.repo
      .createQueryBuilder('dn')
      .leftJoinAndSelect('dn.supplier', 'supplier')
      .leftJoinAndSelect('dn.purchaseOrder', 'purchaseOrder')
      .leftJoinAndSelect('dn.createdBy', 'createdBy')
      .where('dn.tenantId = :tenantId', { tenantId })
      .orderBy('dn.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    if (search) {
      qb.andWhere('(dn.debitNoteNumber ILIKE :search OR dn.reason ILIKE :search)', {
        search: `%${search}%`,
      })
    }

    if (status) {
      qb.andWhere('dn.status = :status', { status })
    }

    return await qb.getManyAndCount()
  }

  async findByIdWithRelations(
    id: string,
    tenantId: string,
    manager?: EntityManager,
  ): Promise<DebitNoteEntity | null> {
    const repo = this.getRepo(manager)
    return await repo.findOne({
      where: { id, tenantId },
      relations: ['supplier', 'purchaseOrder', 'createdBy'],
    })
  }

  async findById(
    id: string,
    tenantId: string,
    manager?: EntityManager,
  ): Promise<DebitNoteEntity | null> {
    const repo = this.getRepo(manager)
    return await repo.findOne({
      where: { id, tenantId },
    })
  }

  async saveDebitNote(debitNote: DebitNoteEntity, manager?: EntityManager): Promise<DebitNoteEntity> {
    const repo = this.getRepo(manager)
    return await repo.save(debitNote)
  }
}
