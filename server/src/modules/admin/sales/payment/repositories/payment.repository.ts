import { BaseStoreRepository } from '@/common/base-repository'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { PaymentEntity } from '../entities/payment.entity'

@Injectable()
export class PaymentRepository extends BaseStoreRepository<PaymentEntity> {
  constructor(
    @InjectRepository(PaymentEntity)
    repo: Repository<PaymentEntity>,
  ) {
    super(PaymentEntity, repo)
}

  async findByTransactionId(
    transactionId: string,
    storeId: string,
  ): Promise<PaymentEntity | null> {
    return await this.repo.findOne({ where: { transactionId, storeId } })
  }

  /**
   * Persists a payment. When a transactional `EntityManager` is supplied the
   * insert participates in the caller's transaction so a later rollback also
   * undoes the payment row (avoids orphaned/duplicate payments).
   */
  async createAndSave(
    dto: any,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<PaymentEntity> {
    const repo = manager ? manager.getRepository(PaymentEntity) : this.repo
    const payment = repo.create({
      ...dto,
      storeId: ctx.storeId,
      userId: ctx.userId,
    } as any) as unknown as PaymentEntity
    return await (repo.save(payment) as Promise<PaymentEntity>)
  }

  /**
   * Server-side paginated list of payments for the admin dashboard.
   * Replaces the previous unbounded `find()` that returned all records.
   */
  async findPaymentsByStore(
    storeId: string,
    page: number,
    limit: number,
    search?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<[PaymentEntity[], number]> {
    const qb = this.repo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .where('payment.storeId = :storeId', { storeId })
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
  async findPaymentsByUser(userId: string, storeId: string): Promise<PaymentEntity[]> {
    return this.repo
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.order', 'order')
      .where('payment.storeId = :storeId', { storeId })
      .andWhere('order.userId = :userId', { userId })
      .orderBy('payment.createdAt', 'DESC')
      .getMany()
  }
}
