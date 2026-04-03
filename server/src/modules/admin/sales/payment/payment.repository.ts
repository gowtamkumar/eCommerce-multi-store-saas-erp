import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PaymentEntity } from './entities/payment.entity'

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly repo: Repository<PaymentEntity>,
  ) { }

  async findByTransactionId(
    transactionId: string,
    tenantId: string,
  ): Promise<PaymentEntity | null> {
    return await this.repo.findOne({ where: { transactionId, tenantId } })
  }

  async createAndSave(dto: any): Promise<PaymentEntity> {
    const payment = this.repo.create(dto as any) as unknown as PaymentEntity
    return await (this.repo.save(payment) as Promise<PaymentEntity>)
  }

  async findPaymentsByTenant(tenantId: string): Promise<PaymentEntity[]> {
    return await this.repo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      relations: ['order'],
    })
  }

  async findPaymentsByUser(userId: string, tenantId: string): Promise<PaymentEntity[]> {
    return await this.repo.find({
      where: {
        tenantId,
        order: { userId },
      },
      order: { createdAt: 'DESC' },
      relations: ['order'],
    })
  }

}
