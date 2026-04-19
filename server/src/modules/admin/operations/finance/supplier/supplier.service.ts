import { PaginationDto } from '@/common/dto/pagination.dto'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto'
import { SupplierEntity } from './entities/supplier.entity'
import { SupplierRepository } from './supplier.repository'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class SupplierService {
  private readonly logger = new Logger(SupplierService.name)

  constructor(
    private readonly repository: SupplierRepository,
    private readonly cacheService: CacheService,
  ) {}

  async createSupplier(dto: CreateSupplierDto, ctx: RequestContextDto): Promise<SupplierEntity> {
    this.logger.log(`${this.createSupplier.name} Service Called`)
    const tenantId = ctx.tenantId
    const result = await this.repository.createAndSave(dto, tenantId)
    await this.cacheService.delCache(`suppliers:list`, tenantId)
    return result
  }

  async findAllSuppliers(
    ctx: RequestContextDto,
    paginationDto: PaginationDto,
  ): Promise<{ items: SupplierEntity[]; total: number; page: number; limit: number; totalPages: number }> {
    this.logger.log(`${this.findAllSuppliers.name} Service Called`)
    const tenantId = ctx.tenantId
    const { page = 1, limit = 20, q: search } = paginationDto
    const cacheKey = `suppliers:list:p${page}:l${limit}:q${search || ''}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [items, total] = await this.repository.findAllByTenant(
          tenantId,
          page,
          limit,
          search,
        )
        return {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      },
      300,
      tenantId,
    )
  }

  async findAllSuppliersRaw(ctx: RequestContextDto): Promise<SupplierEntity[]> {
    this.logger.log(`${this.findAllSuppliersRaw.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = `suppliers:list:raw`
    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [items] = await this.repository.findAllByTenant(tenantId, 1, 9999)
        return items
      },
      300,
      tenantId,
    )
  }

  async findOneSupplier(id: string, ctx: RequestContextDto): Promise<SupplierEntity> {
    this.logger.log(`${this.findOneSupplier.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = `suppliers:id:${id}`

    const supplier = await this.cacheService.rememberCache(
      cacheKey,
      () => this.repository.findByIdAndTenant(id, tenantId),
      600,
      tenantId,
    )

    if (!supplier) {
      throw new NotFoundException('Supplier not found')
    }
    return supplier
  }

  async updateSupplier(id: string, dto: UpdateSupplierDto, ctx: RequestContextDto): Promise<SupplierEntity> {
    this.logger.log(`${this.updateSupplier.name} Service Called`)
    const tenantId = ctx.tenantId
    const supplier = await this.findOneSupplier(id, ctx)
    const result = await this.repository.updateAndSave(supplier, dto)
    await this.cacheService.delCache(`suppliers:list`, tenantId)
    await this.cacheService.delCache(`suppliers:id:${id}`, tenantId)
    return result
  }

  async removeSupplier(id: string, ctx: RequestContextDto): Promise<SupplierEntity> {
    this.logger.log(`${this.removeSupplier.name} Service Called`)
    const tenantId = ctx.tenantId
    const supplier = await this.findOneSupplier(id, ctx)
    const result = await this.repository.removeSupplier(supplier)
    await this.cacheService.delCache(`suppliers:list`, tenantId)
    await this.cacheService.delCache(`suppliers:id:${id}`, tenantId)
    return result
  }
}
