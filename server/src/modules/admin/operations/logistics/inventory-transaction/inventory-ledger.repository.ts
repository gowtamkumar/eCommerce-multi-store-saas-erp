import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { InventoryLedgerEntity } from './entities/inventory-ledger.entity'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class InventoryLedgerRepository {
  constructor(
    @InjectRepository(InventoryLedgerEntity)
    private readonly repo: Repository<InventoryLedgerEntity>,
  ) {}

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
    return await (repo.save(transaction) as unknown as Promise<InventoryLedgerEntity>)
  }
  async getStockSums(tenantId: string): Promise<any[]> {
    return await this.repo
      .createQueryBuilder('ledger')
      .select('ledger.productId', 'productId')
      .addSelect('ledger.variantId', 'variantId')
      .addSelect('SUM(ledger.quantity)', 'sum')
      .where('ledger.tenantId = :tenantId', { tenantId })
      .groupBy('ledger.productId')
      .addGroupBy('ledger.variantId')
      .getRawMany()
  }
  async getGlobalLiveStock(
    productId: string,
    variantId: string | null,
    tenantId: string,
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

    const result = await query.getRawOne()
    return Number(result?.sum || 0)
  }
}
