import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { SubscriptionInvoiceEntity } from './entities/subscription-invoice.entity'

@Injectable()
export class SubscriptionInvoiceRepository extends Repository<SubscriptionInvoiceEntity> {
  constructor(private dataSource: DataSource) {
    super(SubscriptionInvoiceEntity, dataSource.createEntityManager())
  }

  async createAndSave(data: any): Promise<SubscriptionInvoiceEntity> {
    const invoice = this.create(data) as any
    return await this.save(invoice)
  }

  async findAllByTenant(tenantId: string): Promise<SubscriptionInvoiceEntity[]> {
    return await this.find({
      where: { tenantId },
      relations: ['plan'],
      order: { billingDate: 'DESC' },
    })
  }

  async findByTransactionId(transactionId: string): Promise<SubscriptionInvoiceEntity | null> {
    return await this.findOne({
      where: { transactionId },
      relations: ['plan'],
    })
  }

  async updateAndSave(invoice: SubscriptionInvoiceEntity, data: any): Promise<SubscriptionInvoiceEntity> {
    Object.assign(invoice, data)
    return await this.save(invoice)
  }
}
