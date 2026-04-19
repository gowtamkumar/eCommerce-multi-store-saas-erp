import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SubscriptionInvoiceEntity } from './entities/subscription-invoice.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class SubscriptionInvoiceRepository {
  constructor(
    @InjectRepository(SubscriptionInvoiceEntity)
    private readonly repo: Repository<SubscriptionInvoiceEntity>,
  ) {}

  async createAndSave(data: any, ctx: RequestContextDto): Promise<SubscriptionInvoiceEntity> {
    const invoice = this.repo.create({ ...data, tenantId: ctx.tenantId, userId: ctx.userId }) as any
    return await this.repo.save(invoice)
  }

  async findAllByTenant(tenantId: string): Promise<SubscriptionInvoiceEntity[]> {
    return await this.repo.find({
      where: { tenantId },
      relations: ['subscriptionPlan'],
      order: { billingDate: 'DESC' },
    })
  }

  async findByTransactionId(transactionId: string): Promise<SubscriptionInvoiceEntity | null> {
    return await this.repo.findOne({
      where: { transactionId },
      relations: ['subscriptionPlan'],
    })
  }

  async updateAndSave(
    invoice: SubscriptionInvoiceEntity,
    data: any,
  ): Promise<SubscriptionInvoiceEntity> {
    Object.assign(invoice, data)
    return await this.repo.save(invoice)
  }
}
