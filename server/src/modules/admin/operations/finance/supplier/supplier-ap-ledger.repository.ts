import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { SupplierAPLedgerEntity } from './entities/supplier-ap-ledger.entity'
import { SupplierAPReferenceType } from './enums/supplier-ap-Refernce-type.enum'

@Injectable()
export class SupplierAPLedgerRepository {
  constructor(
    @InjectRepository(SupplierAPLedgerEntity)
    private readonly repository: Repository<SupplierAPLedgerEntity>,
  ) { }

  async createEntry(
    data: {
      supplierId: string
      tenantId: string
      referenceType: SupplierAPReferenceType
      referenceId?: string
      debit?: number
      credit?: number
      remarks?: string
    },
    manager?: EntityManager,
  ): Promise<SupplierAPLedgerEntity> {
    const repo = manager ? manager.getRepository(SupplierAPLedgerEntity) : this.repository

    // Lock the last row to calculate running balance safely
    const lastEntry = await repo.createQueryBuilder('ap')
      .setLock('pessimistic_write')
      .where('ap.supplierId = :supplierId', { supplierId: data.supplierId })
      .andWhere('ap.tenantId = :tenantId', { tenantId: data.tenantId })
      .orderBy('ap.createdAt', 'DESC')
      .getOne()

    const previousBalance = lastEntry ? Number(lastEntry.balanceAfter) : 0
    // Credit increases AP (we owe them), Debit decreases AP (we paid them)
    const debit = data.debit || 0
    const credit = data.credit || 0
    const balanceAfter = previousBalance + credit - debit

    const entry = repo.create({
      supplierId: data.supplierId,
      tenantId: data.tenantId,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      debit,
      credit,
      balanceAfter,
      remarks: data.remarks,
    })

    return repo.save(entry)
  }

  async getBalance(supplierId: string, tenantId: string): Promise<number> {
    const lastEntry = await this.repository.findOne({
      where: { supplierId, tenantId },
      order: { createdAt: 'DESC' },
    })
    return lastEntry ? Number(lastEntry.balanceAfter) : 0
  }
}
