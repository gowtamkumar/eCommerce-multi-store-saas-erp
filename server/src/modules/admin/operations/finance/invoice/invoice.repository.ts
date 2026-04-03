import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { InvoiceEntity } from './entities/invoice.entity'

@Injectable()
export class InvoiceRepository {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly repo: Repository<InvoiceEntity>,
  ) { }

  async checkInvoiceNumberExists(
    invoiceNumber: string,
    tenantId: string,
  ): Promise<boolean> {
    const exists = await this.repo.findOne({ where: { invoiceNumber, tenantId } })
    return !!exists
  }

  async createAndSave(
    data: Partial<InvoiceEntity>,
  ): Promise<InvoiceEntity> {
    const invoice = this.repo.create(data as InvoiceEntity)
    return this.repo.save(invoice)
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
  ): Promise<InvoiceEntity | null> {
    return this.repo.findOne({ where: { orderId, tenantId } })
  }

  async updateAndSave(
    invoice: InvoiceEntity,
    data: Partial<InvoiceEntity>,
  ): Promise<InvoiceEntity> {
    Object.assign(invoice, data)
    return this.repo.save(invoice)
  }

  async removeInvoice(invoice: InvoiceEntity): Promise<InvoiceEntity> {
    return this.repo.softRemove(invoice)
  }


}
