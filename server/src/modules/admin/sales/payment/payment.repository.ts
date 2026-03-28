import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { PaymentEntity } from './entities/payment.entity'

@Injectable()
export class PaymentRepository extends Repository<PaymentEntity> {
  constructor(private dataSource: DataSource) {
    super(PaymentEntity, dataSource.createEntityManager())
  }

  async findByTransactionId(
    transactionId: string,
    tenantId: string,
  ): Promise<PaymentEntity | null> {
    return await this.findOne({ where: { transactionId, tenantId } })
  }

  async createAndSave(dto: any): Promise<PaymentEntity> {
    const payment = this.create(dto as any) as unknown as PaymentEntity
    return await (this.save(payment) as Promise<PaymentEntity>)
  }

  async findPaymentsByTenant(tenantId: string): Promise<PaymentEntity[]> {
    return await this.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      relations: ['order'],
    })
  }

  async findPaymentsByUser(userId: string, tenantId: string): Promise<PaymentEntity[]> {
    return await this.find({
      where: {
        tenantId,
        order: { userId },
      },
      order: { createdAt: 'DESC' },
      relations: ['order'],
    })
  }
}
