import { BaseStoreRepository } from '@/common/base-repository'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { createHash } from 'crypto'
import { EntityManager, Repository } from 'typeorm'
import { InventoryLedgerEntity } from './entities/inventory-ledger.entity'

@Injectable()
export class InventoryLedgerRepository extends BaseStoreRepository<InventoryLedgerEntity> {
  constructor(
    @InjectRepository(InventoryLedgerEntity)
    repo: Repository<InventoryLedgerEntity>,
  ) {
    super(InventoryLedgerEntity, repo)
}

  /**
   * Acquires a Postgres transaction-scoped advisory lock keyed by
   * (store, product, variant, warehouse). All writers serialize on this key
   * for the duration of the surrounding transaction — eliminates the
   * read-modify-write race in `createLedgerEntry` and any FEFO allocation
   * that calls into it.
   *
   * pg_advisory_xact_lock takes a single bigint, so we hash the composite
   * key into a stable signed 64-bit integer.
   */
  async acquireStockLock(
    manager: EntityManager,
    storeId: string,
    productId: string,
    variantId: string | null,
    warehouseId: string | null,
  ): Promise<void> {
    const composite = `inv:${storeId}:${productId}:${variantId ?? 'null'}:${warehouseId ?? 'null'}`
    const hash = createHash('sha256').update(composite).digest()
    // Take first 8 bytes, interpret as signed int64 (Postgres bigint domain).
    const lockId = hash.readBigInt64BE(0).toString()
    await manager.query('SELECT pg_advisory_xact_lock($1::bigint)', [lockId])
  }

  async findByStore(
    storeId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    type?: InventoryTransactionType,
  ): Promise<[InventoryLedgerEntity[], number]> {
    const qb = this.repo
      .createQueryBuilder('it')
      .leftJoinAndSelect('it.product', 'product')
      .leftJoinAndSelect('it.variant', 'variant')
      .leftJoinAndSelect('it.user', 'user')
      .leftJoinAndSelect('it.warehouse', 'warehouse')
      .where('it.storeId = :storeId', { storeId })
      .orderBy('it.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    if (search) {
      qb.andWhere('(product.name ILIKE :search OR it.referenceId ILIKE :search)', {
        search: `%${search}%`,
      })
    }

    if (type) {
      qb.andWhere('it.type = :type', { type })
    }

    return await qb.getManyAndCount()
  }

  async getLatestBalanceAfter(
    productId: string,
    variantId: string | null,
    warehouseId: string | null,
    storeId: string,
    manager?: any,
  ): Promise<number> {
    const repo = this.txRepo(manager)
    const where: Record<string, any> = { productId, storeId }
    if (variantId) where.variantId = variantId
    if (warehouseId) where.warehouseId = warehouseId

    const lastEntry = await repo.findOne({
      where,
      order: { createdAt: 'DESC' },
    })

    return lastEntry ? Number(lastEntry.balanceAfter) : 0
  }

  async findByProduct(productId: string, storeId: string): Promise<InventoryLedgerEntity[]> {
    return await this.repo.find({
      where: { productId, storeId },
      order: { createdAt: 'DESC' },
      relations: {
        product: true,
        variant: true,
        user: true,
        warehouse: true,
      },
    })
  }

  async createAndSave(
    dto: any,
    ctx: RequestContextDto,
    manager?: any,
  ): Promise<InventoryLedgerEntity> {
    const repo = this.txRepo(manager)
    const transaction = repo.create({
      ...dto,
      storeId: ctx.storeId,
      userId: ctx.userId,
    } as Partial<InventoryLedgerEntity>)
    if (dto.createdAt) {
      transaction.createdAt = new Date(dto.createdAt)
    }
    return repo.save(transaction)
  }
  async getStockSums(storeId: string, warehouseId?: string): Promise<any[]> {
    const qb = this.repo
      .createQueryBuilder('ledger')
      .select('ledger.productId', 'productId')
      .addSelect('ledger.variantId', 'variantId')
      .addSelect('SUM(ledger.quantity)', 'sum')
      .where('ledger.storeId = :storeId', { storeId })

    if (warehouseId) {
      qb.andWhere('ledger.warehouseId = :warehouseId', { warehouseId })
    }

    return await qb.groupBy('ledger.productId').addGroupBy('ledger.variantId').getRawMany()
  }

  /**
   * Stock sums restricted to a specific set of product IDs. Used to enrich a
   * single page of products without aggregating the entire store ledger,
   * which keeps product list/detail cost proportional to the page size rather
   * than total inventory movements.
   */
  async getStockSumsByProductIds(
    storeId: string,
    productIds: string[],
    warehouseId?: string,
  ): Promise<any[]> {
    if (!productIds || productIds.length === 0) return []

    const qb = this.repo
      .createQueryBuilder('ledger')
      .select('ledger.productId', 'productId')
      .addSelect('ledger.variantId', 'variantId')
      .addSelect('SUM(ledger.quantity)', 'sum')
      .where('ledger.storeId = :storeId', { storeId })
      .andWhere('ledger.productId IN (:...productIds)', { productIds })

    if (warehouseId) {
      qb.andWhere('ledger.warehouseId = :warehouseId', { warehouseId })
    }

    return await qb.groupBy('ledger.productId').addGroupBy('ledger.variantId').getRawMany()
  }
  async getLiveStock(
    productId: string,
    variantId: string | null,
    storeId: string,
    warehouseId?: string | null,
    manager?: any,
  ): Promise<number> {
    const repo = this.txRepo(manager)

    const query = repo
      .createQueryBuilder('ledger')
      .select('SUM(ledger.quantity)', 'sum')
      .where('ledger.productId = :productId', { productId })
      .andWhere('ledger.storeId = :storeId', { storeId })

    if (variantId) {
      query.andWhere('ledger.variantId = :variantId', { variantId })
    } else {
      query.andWhere('ledger.variantId IS NULL')
    }

    if (warehouseId) {
      query.andWhere('ledger.warehouseId = :warehouseId', { warehouseId })
    }

    const result = await query.getRawOne()
    return Number(result?.sum || 0)
  }
}
