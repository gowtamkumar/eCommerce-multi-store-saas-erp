import { BaseStoreRepository } from '@/common/base-repository'
import { getTransactionalRepo } from '@/common/utils/repository.util'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { SupplierAPLedgerEntity } from './entities/supplier-ap-ledger.entity'
import { SupplierAPReferenceType } from './enums/supplier-ap-Refernce-type.enum'

@Injectable()
export class SupplierAPLedgerRepository extends BaseStoreRepository<SupplierAPLedgerEntity> {
  constructor(
    @InjectRepository(SupplierAPLedgerEntity)
    private readonly repository: Repository<SupplierAPLedgerEntity>,
  ) {
    super(SupplierAPLedgerEntity, repository)
  }

  async createEntry(
    data: {
      supplierId: string
      storeId: string
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
      .andWhere('ap.storeId = :storeId', { storeId: data.storeId })
      .orderBy('ap.createdAt', 'DESC')
      .getOne()

    const previousBalance = lastEntry ? Number(lastEntry.balanceAfter) : 0
    // Credit increases AP (we owe them), Debit decreases AP (we paid them)
    const debit = data.debit || 0
    const credit = data.credit || 0
    const balanceAfter = previousBalance + credit - debit

    const entry = repo.create({
      supplierId: data.supplierId,
      storeId: data.storeId,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      debit,
      credit,
      balanceAfter,
      remarks: data.remarks,
    })

    return repo.save(entry)
  }

  async getBalance(supplierId: string, storeId: string): Promise<number> {
    const lastEntry = await this.repository.findOne({
      where: { supplierId, storeId },
      order: { createdAt: 'DESC' },
    })
    return lastEntry ? Number(lastEntry.balanceAfter) : 0
  }

  /**
   * Bulk variant of getBalance: resolves the latest running balance for many
   * suppliers in a single query (avoids N+1 on supplier list endpoints).
   * Returns a map of supplierId -> outstanding balance (defaults to 0).
   */
  async getBalances(supplierIds: string[], storeId: string): Promise<Map<string, number>> {
    const balances = new Map<string, number>()
    if (supplierIds.length === 0) return balances

    // DISTINCT ON must immediately follow SELECT — TypeORM's query builder
    // mis-orders columns when DISTINCT ON is embedded in .select() + .addSelect().
    const rows = await this.repository.manager.query<
      Array<{ supplierId: string; balanceAfter: string }>
    >(
      `
        SELECT DISTINCT ON (ap.supplier_id)
          ap.supplier_id AS "supplierId",
          ap.balance_after AS "balanceAfter"
        FROM supplier_ap_ledger ap
        WHERE ap.supplier_id = ANY($1::uuid[])
          AND ap.store_id = $2::uuid
          AND ap.deleted_at IS NULL
        ORDER BY ap.supplier_id ASC, ap.created_at DESC
      `,
      [supplierIds, storeId],
    )

    for (const row of rows) {
      balances.set(row.supplierId, Number(row.balanceAfter))
    }
    return balances
  }
}
