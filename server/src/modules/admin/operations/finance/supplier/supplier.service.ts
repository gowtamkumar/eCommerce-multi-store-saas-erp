import { PaginationDto } from '@/common/dto/pagination.dto'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto'
import { SupplierEntity } from './entities/supplier.entity'
import { SupplierRepository } from './supplier.repository'
import { RequestContextDto } from '@/common/dto/request-context.dto'

import { SupplierAPLedgerRepository } from './supplier-ap-ledger.repository'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SupplierAPLedgerEntity } from './entities/supplier-ap-ledger.entity'

@Injectable()
export class SupplierService {
  private readonly logger = new Logger(SupplierService.name)

  constructor(
    private readonly repository: SupplierRepository,
    private readonly cacheService: CacheService,
    private readonly apLedgerRepository: SupplierAPLedgerRepository,
    @InjectRepository(SupplierAPLedgerEntity)
    private readonly apLedgerBaseRepo: Repository<SupplierAPLedgerEntity>,
  ) {}

  async createSupplier(dto: CreateSupplierDto, ctx: RequestContextDto): Promise<SupplierEntity> {
    this.logger.log(`${this.createSupplier.name} Service Called`)
    const storeId = ctx.storeId
    const result = await this.repository.createAndSave(dto, ctx)
    await this.cacheService.delCacheByPattern(`suppliers:list*`, storeId)
    return result
  }

  async findAllSuppliers(
    ctx: RequestContextDto,
    paginationDto: PaginationDto,
  ): Promise<{
    items: SupplierEntity[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    this.logger.log(`${this.findAllSuppliers.name} Service Called`)
    const storeId = ctx.storeId
    const { page = 1, limit = 20, q: search } = paginationDto
    const cacheKey = `suppliers:list:p${page}:l${limit}:q${search || ''}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [items, total] = await this.repository.findAllByStore(storeId, page, limit, search)

        // Bulk-resolve outstanding balances in a single query (avoids N+1).
        const balances = await this.apLedgerRepository.getBalances(
          items.map((item) => item.id),
          storeId,
        )
        for (const item of items) {
          item.outstandingBalance = balances.get(item.id) ?? 0
        }

        return {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      },
      300,
      storeId,
    )
  }

  async findAllSuppliersRaw(ctx: RequestContextDto): Promise<SupplierEntity[]> {
    this.logger.log(`${this.findAllSuppliersRaw.name} Service Called`)
    const storeId = ctx.storeId
    const cacheKey = `suppliers:list:raw`
    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [items] = await this.repository.findAllByStore(storeId, 1, 9999)
        return items
      },
      300,
      storeId,
    )
  }

  async findOneSupplier(id: string, ctx: RequestContextDto): Promise<SupplierEntity> {
    this.logger.log(`${this.findOneSupplier.name} Service Called`)
    const storeId = ctx.storeId
    const cacheKey = `suppliers:id:${id}`

    const supplier = await this.cacheService.rememberCache(
      cacheKey,
      () => this.repository.findByIdAndStore(id, storeId),
      600,
      storeId,
    )

    if (!supplier) {
      throw new NotFoundException('Supplier not found')
    }

    supplier.outstandingBalance = await this.apLedgerRepository.getBalance(id, storeId)
    return supplier
  }

  async updateSupplier(
    id: string,
    dto: UpdateSupplierDto,
    ctx: RequestContextDto,
  ): Promise<SupplierEntity> {
    this.logger.log(`${this.updateSupplier.name} Service Called`)
    const storeId = ctx.storeId
    const supplier = await this.findOneSupplier(id, ctx)
    const result = await this.repository.updateAndSave(supplier, dto)
    await this.cacheService.delCacheByPattern(`suppliers:list*`, storeId)
    await this.cacheService.delCache(`suppliers:id:${id}`, storeId)
    return result
  }

  async removeSupplier(id: string, ctx: RequestContextDto): Promise<SupplierEntity> {
    this.logger.log(`${this.removeSupplier.name} Service Called`)
    const storeId = ctx.storeId
    const supplier = await this.findOneSupplier(id, ctx)
    const result = await this.repository.removeSupplier(supplier)
    await this.cacheService.delCacheByPattern(`suppliers:list*`, storeId)
    await this.cacheService.delCache(`suppliers:id:${id}`, storeId)
    return result
  }

  async getLedger(supplierId: string, ctx: RequestContextDto, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto
    const [items, total] = await this.apLedgerBaseRepo.findAndCount({
      where: { supplierId, storeId: ctx.storeId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }
}
