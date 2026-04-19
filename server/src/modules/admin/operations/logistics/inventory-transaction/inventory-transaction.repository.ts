import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { InventoryTransactionEntity } from './entities/inventory-transaction.entity'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class InventoryTransactionRepository {
  constructor(
    @InjectRepository(InventoryTransactionEntity)
    private readonly repo: Repository<InventoryTransactionEntity>,
  ) {}

  /**
   * Fetches paginated inventory transactions for the admin list view.
   * Fixed broken relations (was using 'variants' which didn't exist)
   * and added server-side filtering.
   */
  async findByTenant(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    type?: InventoryTransactionType,
  ): Promise<[InventoryTransactionEntity[], number]> {
    const qb = this.repo
      .createQueryBuilder('it')
      .leftJoinAndSelect('it.product', 'product')
      .leftJoinAndSelect('it.variant', 'variant')
      .leftJoinAndSelect('it.user', 'user')
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

  async findByProduct(productId: string, tenantId: string): Promise<InventoryTransactionEntity[]> {
    return await this.repo.find({
      where: { productId, tenantId },
      order: { createdAt: 'DESC' },
      relations: ['product', 'variant', 'user'],
    })
  }

  async createAndSave(
    dto: any,
    ctx: RequestContextDto,
    manager?: any,
  ): Promise<InventoryTransactionEntity> {
    const repo = manager ? manager.getRepository(InventoryTransactionEntity) : this.repo
    const transaction = repo.create({ ...dto, tenantId: ctx.tenantId, userId: ctx.userId })
    return await repo.save(transaction)
  }
}
