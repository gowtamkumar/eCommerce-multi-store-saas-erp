import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { SupplierInvoiceEntity, SupplierInvoiceStatus } from '../entities/supplier-invoice.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class SupplierInvoiceRepository {
  constructor(
    @InjectRepository(SupplierInvoiceEntity)
    private readonly repo: Repository<SupplierInvoiceEntity>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<SupplierInvoiceEntity> {
    return manager ? manager.getRepository(SupplierInvoiceEntity) : this.repo
  }

  async createAndSave(
    data: Partial<SupplierInvoiceEntity>,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<SupplierInvoiceEntity> {
    const repo = this.getRepo(manager)
    const invoice = repo.create({
      ...data,
      tenantId: ctx.tenantId,
      createdById: ctx.userId,
    } as SupplierInvoiceEntity)
    return repo.save(invoice)
  }

  async findAllByTenant(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: SupplierInvoiceStatus,
  ): Promise<[SupplierInvoiceEntity[], number]> {
    const qb = this.repo
      .createQueryBuilder('si')
      .leftJoinAndSelect('si.supplier', 'supplier')
      .leftJoinAndSelect('si.purchaseOrder', 'purchaseOrder')
      .leftJoinAndSelect('si.createdBy', 'createdBy')
      .where('si.tenantId = :tenantId', { tenantId })
      .orderBy('si.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    if (search) {
      qb.andWhere('(si.invoiceNumber ILIKE :search OR si.discrepancyNotes ILIKE :search)', {
        search: `%${search}%`,
      })
    }

    if (status) {
      qb.andWhere('si.status = :status', { status })
    }

    return await qb.getManyAndCount()
  }

  async findByIdWithRelations(
    id: string,
    tenantId: string,
    manager?: EntityManager,
  ): Promise<SupplierInvoiceEntity | null> {
    const repo = this.getRepo(manager)
    return await repo.findOne({
      where: { id, tenantId },
      relations: {
        supplier: true,
        purchaseOrder: true,
        createdBy: true,
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
  ): Promise<SupplierInvoiceEntity | null> {
    const repo = this.getRepo(manager)
    return await repo.findOne({
      where: { id, tenantId },
    })
  }

  async saveInvoice(
    invoice: SupplierInvoiceEntity,
    manager?: EntityManager,
  ): Promise<SupplierInvoiceEntity> {
    const repo = this.getRepo(manager)
    return await repo.save(invoice)
  }
}
