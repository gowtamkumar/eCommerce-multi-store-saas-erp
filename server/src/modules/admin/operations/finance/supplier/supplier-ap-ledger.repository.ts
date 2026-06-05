import { getTransactionalRepo } from '@/common/utils/repository.util'
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
  ) {}

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
    const repo = getTransactionalRepo(SupplierAPLedgerEntity, this.repository, manager)

    // Lock the last row to calculate running balance safely
    const lastEntry = await repo
      .createQueryBuilder('ap')
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

  /**
   * Bulk variant of getBalance: resolves the latest running balance for many
   * suppliers in a single query (avoids N+1 on supplier list endpoints).
   * Returns a map of supplierId -> outstanding balance (defaults to 0).
   */
  async getBalances(supplierIds: string[], tenantId: string): Promise<Map<string, number>> {
    const balances = new Map<string, number>()
    if (supplierIds.length === 0) return balances

    // DISTINCT ON returns the first row per supplier given the ORDER BY,
    // i.e. the most recent ledger entry for each supplier.
    const rows = await this.repository
      .createQueryBuilder('ap')
      .select('DISTINCT ON (ap.supplierId) ap.supplierId', 'supplierId')
      .addSelect('ap.balanceAfter', 'balanceAfter')
      .where('ap.supplierId IN (:...supplierIds)', { supplierIds })
      .andWhere('ap.tenantId = :tenantId', { tenantId })
      .orderBy('ap.supplierId')
      .addOrderBy('ap.createdAt', 'DESC')
      .getRawMany<{ supplierId: string; balanceAfter: string }>()

    for (const row of rows) {
      balances.set(row.supplierId, Number(row.balanceAfter))
    }
    return balances
  }
}
