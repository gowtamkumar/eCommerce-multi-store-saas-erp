import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { SupplierPaymentEntity } from './entities/supplier-payment.entity'

@Injectable()
export class SupplierPaymentRepository extends Repository<SupplierPaymentEntity> {
  constructor(private dataSource: DataSource) {
    super(SupplierPaymentEntity, dataSource.createEntityManager())
  }

  private getRepo(manager?: EntityManager): Repository<SupplierPaymentEntity> {
    return manager ? manager.getRepository(SupplierPaymentEntity) : this
  }

  async createAndSave(
    data: Partial<SupplierPaymentEntity>,
    manager?: EntityManager,
  ): Promise<SupplierPaymentEntity> {
    const repo = this.getRepo(manager)
    const payment = repo.create(data as SupplierPaymentEntity)
    return repo.save(payment)
  }

  async findAllBySupplier(supplierId: string, tenantId: string): Promise<SupplierPaymentEntity[]> {
    return this.find({
      where: { supplierId, tenantId },
      order: { paymentDate: 'DESC' },
    })
  }

  async findAllPayments(tenantId: string): Promise<SupplierPaymentEntity[]> {
    return this.find({
      where: { tenantId },
      relations: ['supplier', 'purchaseOrder'],
      order: { paymentDate: 'DESC' },
    })
  }
}
