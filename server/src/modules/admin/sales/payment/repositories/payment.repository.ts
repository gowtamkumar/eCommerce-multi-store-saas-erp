import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PaymentEntity } from '../entities/payment.entity'

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly repo: Repository<PaymentEntity>,
  ) {}

  async findByTransactionId(
    transactionId: string,
    tenantId: string,
  ): Promise<PaymentEntity | null> {
    return await this.repo.findOne({ where: { transactionId, tenantId } })
  }

  async createAndSave(dto: any, ctx: RequestContextDto): Promise<PaymentEntity> {
    const payment = this.repo.create({
      ...dto,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
    } as any) as unknown as PaymentEntity
    return await (this.repo.save(payment) as Promise<PaymentEntity>)
  }

  /**
   * Server-side paginated list of payments for the admin dashboard.
   * Replaces the previous unbounded `find()` that returned all records.
   */
  async findPaymentsByTenant(
    tenantId: string,
    page: number,
    limit: number,
    search?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<[PaymentEntity[], number]> {
    const qb = this.repo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .where('payment.tenantId = :tenantId', { tenantId })
      .orderBy('payment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    if (search) {
      qb.andWhere(
        '(payment.transactionId ILIKE :search OR order.customerName ILIKE :search OR CAST(payment.method AS TEXT) ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    if (startDate) {
      qb.andWhere('payment.createdAt >= :startDate', { startDate })
    }

    if (endDate) {
      qb.andWhere('payment.createdAt <= :endDate', { endDate })
    }

    return qb.getManyAndCount()
  }

  /**
   * Fetch payments by user — uses QueryBuilder JOIN to avoid unreliable
   * nested `where: { order: { userId } }` TypeORM patterns.
   */
  async findPaymentsByUser(userId: string, tenantId: string): Promise<PaymentEntity[]> {
    return this.repo
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.order', 'order')
      .where('payment.tenantId = :tenantId', { tenantId })
      .andWhere('order.userId = :userId', { userId })
      .orderBy('payment.createdAt', 'DESC')
      .getMany()
  }
}
