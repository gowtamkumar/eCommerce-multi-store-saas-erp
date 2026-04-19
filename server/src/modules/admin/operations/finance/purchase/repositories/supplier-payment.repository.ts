import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { SupplierPaymentEntity } from '../entities/supplier-payment.entity'

@Injectable()
export class SupplierPaymentRepository {
  constructor(
    @InjectRepository(SupplierPaymentEntity)
    private readonly repo: Repository<SupplierPaymentEntity>,
  ) { }

  private getRepo(manager?: EntityManager): Repository<SupplierPaymentEntity> {
    return manager ? manager.getRepository(SupplierPaymentEntity) : this.repo
  }

  async createAndSave(
    data: Partial<SupplierPaymentEntity>,
    userId?: string,
    manager?: EntityManager,
  ): Promise<SupplierPaymentEntity> {
    const repo = this.getRepo(manager)
    const payment = repo.create({ ...data, userId } as SupplierPaymentEntity)
    return repo.save(payment)
  }

  async findAllBySupplier(supplierId: string, tenantId: string): Promise<SupplierPaymentEntity[]> {
    return this.repo.find({
      where: { supplierId, tenantId },
      order: { paymentDate: 'DESC' },
    })
  }

  async findAllPayments(tenantId: string): Promise<SupplierPaymentEntity[]> {
    return this.repo.find({
      where: { tenantId },
      relations: ['supplier', 'purchaseOrder'],
      order: { paymentDate: 'DESC' },
    })
  }
}
