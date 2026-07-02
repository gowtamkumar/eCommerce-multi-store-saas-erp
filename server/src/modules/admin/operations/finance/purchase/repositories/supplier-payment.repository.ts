import { BaseStoreRepository } from '@/common/base-repository'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { SupplierPaymentEntity } from '../entities/supplier-payment.entity'

@Injectable()
export class SupplierPaymentRepository extends BaseStoreRepository<SupplierPaymentEntity> {
  constructor(
    @InjectRepository(SupplierPaymentEntity)
    repo: Repository<SupplierPaymentEntity>,
  ) {
    super(SupplierPaymentEntity, repo)
}

  private getRepo(manager?: EntityManager): Repository<SupplierPaymentEntity> {
    return this.txRepo(manager)
  }

  async createAndSave(
    data: Partial<SupplierPaymentEntity>,
    ctx: RequestContextDto,
    manager?: EntityManager,
  ): Promise<SupplierPaymentEntity> {
    const repo = this.getRepo(manager)
    const payment = repo.create({
      ...data,
      storeId: ctx.storeId,
      userId: ctx.userId,
    } as SupplierPaymentEntity)
    return repo.save(payment)
  }

  async findAllBySupplier(supplierId: string, storeId: string): Promise<SupplierPaymentEntity[]> {
    return this.repo.find({
      where: { supplierId, storeId },
      order: { paymentDate: 'DESC' },
    })
  }

  async findAllPayments(storeId: string): Promise<SupplierPaymentEntity[]> {
    return this.repo.find({
      where: { storeId },
      relations: {
        supplier: true,
        purchaseOrder: true,
      },
      order: { paymentDate: 'DESC' },
    })
  }
}
