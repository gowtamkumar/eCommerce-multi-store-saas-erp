import { RequestContextDto } from '@/common/dto/request-context.dto'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { createHash } from 'crypto'
import { EntityManager, Repository } from 'typeorm'
import { InventoryLedgerEntity } from './entities/inventory-ledger.entity'

@Injectable()
export class InventoryLedgerRepository {
  constructor(
    @InjectRepository(InventoryLedgerEntity)
    private readonly repo: Repository<InventoryLedgerEntity>,
  ) {}

  /**
   * Acquires a Postgres transaction-scoped advisory lock keyed by
   * (tenant, product, variant, warehouse). All writers serialize on this key
   * for the duration of the surrounding transaction — eliminates the
   * read-modify-write race in `createLedgerEntry` and any FEFO allocation
   * that calls into it.
   *
   * pg_advisory_xact_lock takes a single bigint, so we hash the composite
   * key into a stable signed 64-bit integer.
   */
  async acquireStockLock(
    manager: EntityManager,
    tenantId: string,
    productId: string,
    variantId: string | null,
    warehouseId: string | null,
  ): Promise<void> {
    const composite = `inv:${tenantId}:${productId}:${variantId ?? 'null'}:${warehouseId ?? 'null'}`
    const hash = createHash('sha256').update(composite).digest()
    // Take first 8 bytes, interpret as signed int64 (Postgres bigint domain).
    const lockId = hash.readBigInt64BE(0).toString()
    await manager.query('SELECT pg_advisory_xact_lock($1::bigint)', [lockId])
  }

  async findByTenant(
    tenantId: string,
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
      .where('it.tenantId = :tenantId', { tenantId })
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
    tenantId: string,
    manager?: any,
  ): Promise<number> {
    const repo = manager ? manager.getRepository(InventoryLedgerEntity) : this.repo
    const where: Record<string, any> = { productId, tenantId }
    if (variantId) where.variantId = variantId
    if (warehouseId) where.warehouseId = warehouseId

    const lastEntry = await repo.findOne({
      where,
      order: { createdAt: 'DESC' },
    })

    return lastEntry ? Number(lastEntry.balanceAfter) : 0
  }

  async findByProduct(productId: string, tenantId: string): Promise<InventoryLedgerEntity[]> {
    return await this.repo.find({
      where: { productId, tenantId },
      order: { createdAt: 'DESC' },
      relations: ['product', 'variant', 'user', 'warehouse'],
    })
  }

  async createAndSave(
    dto: any,
    ctx: RequestContextDto,
    manager?: any,
  ): Promise<InventoryLedgerEntity> {
    const repo = manager ? manager.getRepository(InventoryLedgerEntity) : this.repo
    const transaction = repo.create({ ...dto, tenantId: ctx.tenantId, userId: ctx.userId })
    if (dto.createdAt) {
      transaction.createdAt = new Date(dto.createdAt)
    }
    return await (repo.save(transaction) as unknown as Promise<InventoryLedgerEntity>)
  }
  async getStockSums(tenantId: string, warehouseId?: string): Promise<any[]> {
    const qb = this.repo
      .createQueryBuilder('ledger')
      .select('ledger.productId', 'productId')
      .addSelect('ledger.variantId', 'variantId')
      .addSelect('SUM(ledger.quantity)', 'sum')
      .where('ledger.tenantId = :tenantId', { tenantId })

    if (warehouseId) {
      qb.andWhere('ledger.warehouseId = :warehouseId', { warehouseId })
    }

    return await qb.groupBy('ledger.productId').addGroupBy('ledger.variantId').getRawMany()
  }
  async getLiveStock(
    productId: string,
    variantId: string | null,
    tenantId: string,
    warehouseId?: string | null,
    manager?: any,
  ): Promise<number> {
    const repo = manager ? manager.getRepository(InventoryLedgerEntity) : this.repo

    const query = repo
      .createQueryBuilder('ledger')
      .select('SUM(ledger.quantity)', 'sum')
      .where('ledger.productId = :productId', { productId })
      .andWhere('ledger.tenantId = :tenantId', { tenantId })

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
