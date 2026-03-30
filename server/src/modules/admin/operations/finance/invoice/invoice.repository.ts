import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { InvoiceEntity } from './entities/invoice.entity'

@Injectable()
export class InvoiceRepository extends Repository<InvoiceEntity> {
  constructor(private dataSource: DataSource) {
    super(InvoiceEntity, dataSource.createEntityManager())
  }

  private getRepo(manager?: EntityManager): Repository<InvoiceEntity> {
    return manager ? manager.getRepository(InvoiceEntity) : this
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
    return this.find({
      where: { tenantId },
      relations: ['order', 'order.items', 'order.items.product'],
      order: { createdAt: 'DESC' },
    })
  }

  async findByIdWithRelations(id: string, tenantId: string): Promise<InvoiceEntity | null> {
    return this.findOne({
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
    return this.softRemove(invoice)
  }
}
