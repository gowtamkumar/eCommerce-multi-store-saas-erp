import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { CreateInventoryTransactionDto } from '@/modules/admin/operations/logistics/inventory-transaction/dto/create-inventory-transaction.dto'
import { InventoryTransactionRepository } from './inventory-transaction.repository'
import { ProductRepository } from '@/modules/admin/catalog/product/repositories/product.repository'
import { ProductVariantRepository } from '@/modules/admin/catalog/product/repositories/variant.repository'
import { InventoryTransactionEntity } from './entities/inventory-transaction.entity'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { InventoryTransactionType as ITType } from '@/common/enums/inventory-transaction-type.enum'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class InventoryTransactionService {
  private readonly logger = new Logger(InventoryTransactionService.name)

  constructor(
    private readonly repository: InventoryTransactionRepository,
    private readonly productRepository: ProductRepository,
    private readonly variantRepository: ProductVariantRepository,
    private readonly cacheService: CacheService,
  ) { }

  /**
   * Records a stock movement and updates the product/variant static stock cache atomically.
   */
  async createInventoryTransaction(
    dto: CreateInventoryTransactionDto,
    ctx: RequestContextDto,
    manager?: any,
  ): Promise<InventoryTransactionEntity> {
    this.logger.log(`${this.createInventoryTransaction.name} Service Called`)
    const tenantId = ctx.tenantId

    const product = await this.productRepository.findByIdWithRelations(dto.productId, tenantId)
    if (!product) {
      throw new NotFoundException('Product not found')
    }

    const isIncrement = dto.type !== InventoryTransactionType.OUT
    const absQty = Math.abs(dto.quantity)

    if (dto.variantId) {
      if (isIncrement) {
        await this.variantRepository.incrementStock(dto.variantId, tenantId, absQty, manager)
      } else {
        await this.variantRepository.decrementStock(dto.variantId, tenantId, absQty, manager)
      }
    } else {
      if (isIncrement) {
        await this.productRepository.incrementStock(product.id, tenantId, absQty, manager)
      } else {
        await this.productRepository.decrementStock(product.id, tenantId, absQty, manager)
      }
    }

    const transaction = await this.repository.createAndSave(dto, ctx, manager)

    // Invalidate inventory caches
    await this.cacheService.delCache(`inventory:list`, tenantId)
    await this.cacheService.delCache(`inventory:summary`, tenantId)

    return transaction
  }

  /**
   * Returns paginated inventory transaction logs.
   */
  async findAllInventoryTransactions(
    ctx: RequestContextDto,
    paginationDto: PaginationDto,
    type?: ITType,
  ): Promise<{ items: InventoryTransactionEntity[]; total: number; page: number; limit: number; totalPages: number }> {
    this.logger.log(`${this.findAllInventoryTransactions.name} Service Called`)
    const tenantId = ctx.tenantId
    const { page = 1, limit = 20, q: search } = paginationDto
    const cacheKey = `inventory:list:p${page}:l${limit}:q${search || ''}:t${type || ''}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [items, total] = await this.repository.findByTenant(
          tenantId,
          page,
          limit,
          search,
          type,
        )
        return {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      },
      300, // 5 min cache
      tenantId,
    )
  }

  async findByProductInventoryTransactions(productId: string, ctx: RequestContextDto): Promise<InventoryTransactionEntity[]> {
    this.logger.log(`${this.findByProductInventoryTransactions.name} Service Called`)
    const tenantId = ctx.tenantId
    return await this.repository.findByProduct(productId, tenantId)
  }

  /**
   * Corrected service method: Pulls real products with their current stock and variants.
   * Fixes the critical bug where it was previously pulling transaction logs as products.
   */
  async getStockSummaryInventoryTransactions(ctx: RequestContextDto): Promise<any[]> {
    this.logger.log(`${this.getStockSummaryInventoryTransactions.name} Service Called`)
    const tenantId = ctx.tenantId

    return this.cacheService.rememberCache(
      `inventory:summary`,
      async () => {
        // Fetch all products with variants for the summary
        // We use a high limit here because the dashboard expects the full picture
        const [products] = await this.productRepository.findAllWithFilters({ limit: 1000 }, tenantId)

        return products.map((product) => {
          const hasVariants = product.variants && product.variants.length > 0
          const totalStock = hasVariants
            ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
            : product.stock
          const totalValue = hasVariants
            ? product.variants.reduce(
              (sum, v) => sum + (v.stock || 0) * Number(v.price || product.price),
              0,
            )
            : product.stock * Number(product.price)

          const isLowStock = hasVariants
            ? product.variants.some(
              (v) => v.stock <= (v.lowStockThreshold ?? product.lowStockThreshold ?? 5),
            )
            : product.stock <= (product.lowStockThreshold ?? 5)

          const isOutOfStock = hasVariants
            ? product.variants.some((v) => v.stock === 0)
            : product.stock === 0

          return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            images: product.images,
            price: product.price,
            status: product.status,
            categoryName: (product as any).category?.name || null,
            supplierName: (product as any).supplier?.name || null,
            hasVariants,
            stock: totalStock,
            stockValue: totalValue,
            variants: hasVariants
              ? product.variants.map((v: any) => ({
                id: v.id,
                sku: v.sku,
                combination: v.combination,
                price: v.price || product.price,
                stock: v.stock,
                lowStockThreshold: v.lowStockThreshold || product.lowStockThreshold || 5,
              }))
              : [],
            lowStock: isLowStock,
            outOfStock: isOutOfStock,
          }
        })
      },
      600, // 10 min cache for stock summary
      tenantId,
    )
  }
}
