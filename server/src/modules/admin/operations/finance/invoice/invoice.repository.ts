import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { InvoiceEntity } from './entities/invoice.entity'

@Injectable()
export class InvoiceRepository {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly repo: Repository<InvoiceEntity>,
  ) { }

  private getRepo(manager?: EntityManager): Repository<InvoiceEntity> {
    return manager ? manager.getRepository(InvoiceEntity) : this.repo
  }

  async checkInvoiceNumberExists(
    invoiceNumber: string,
    tenantId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const repo = this.getRepo(manager)
    const exists = await repo.findOne({ where: { invoiceNumber, tenantId } })
    return !!exists
  }

  async createAndSave(
    data: Partial<InvoiceEntity>,
    manager?: EntityManager,
  ): Promise<InvoiceEntity> {
    const repo = this.getRepo(manager)
    const invoice = repo.create(data as InvoiceEntity)
    return repo.save(invoice)
  }

  async findAllWithRelations(tenantId: string): Promise<InvoiceEntity[]> {
    return this.repo.find({
      where: { tenantId },
      relations: ['order', 'order.items', 'order.items.product'],
      order: { createdAt: 'DESC' },
    })
  }

  async findByIdWithRelations(id: string, tenantId: string): Promise<InvoiceEntity | null> {
    return this.repo.findOne({
      where: { id, tenantId },
      relations: ['order', 'order.items', 'order.items.product'],
    })
  }

  async findByOrderId(
    orderId: string,
    tenantId: string,
    manager?: EntityManager,
  ): Promise<InvoiceEntity | null> {
    return this.getRepo(manager).findOne({ where: { orderId, tenantId } })
  }

  async updateAndSave(
    invoice: InvoiceEntity,
    data: Partial<InvoiceEntity>,
    manager?: EntityManager,
  ): Promise<InvoiceEntity> {
    const repo = this.getRepo(manager)
    Object.assign(invoice, data)
    return repo.save(invoice)
  }

  async removeInvoice(invoice: InvoiceEntity): Promise<InvoiceEntity> {
    return this.repo.softRemove(invoice)
  }
}
