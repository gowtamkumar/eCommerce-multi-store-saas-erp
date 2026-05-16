import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { CreateInventoryTransactionDto } from '@/modules/admin/operations/logistics/inventory-transaction/dto/create-inventory-transaction.dto'
import { InventoryLedgerRepository } from './inventory-ledger.repository'
import { InventoryLedgerEntity } from './entities/inventory-ledger.entity'
import { ProductRepository } from '@/modules/admin/catalog/product/repositories/product.repository'
import { ProductVariantRepository } from '@/modules/admin/catalog/product/repositories/variant.repository'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { CacheService } from '../../infra/cache/cache.service'
import { CogsService } from '@/modules/admin/operations/finance/accounting/services/cogs.service'
import { AccountingIntegrationService } from '@/modules/admin/operations/finance/accounting/services/accounting-integration.service'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'

@Injectable()
export class InventoryLedgerService {
  private readonly logger = new Logger(InventoryLedgerService.name)

  constructor(
    private readonly repository: InventoryLedgerRepository,
    private readonly productRepository: ProductRepository,
    private readonly variantRepository: ProductVariantRepository,
    private readonly cacheService: CacheService,
    private readonly cogsService: CogsService,
    private readonly accountingIntegration: AccountingIntegrationService,
  ) { }

  /**
   * Records a stock movement and updates the product/variant static stock cache atomically.
   * This implements the "Dual-Write" strategy for Phase 2.
   */
  async createLedgerEntry(
    dto: CreateInventoryTransactionDto,
    ctx: RequestContextDto,
    manager?: any,
  ): Promise<InventoryLedgerEntity> {
    this.logger.log(`${this.createLedgerEntry.name} Service Called`)
    const tenantId = ctx.tenantId

    const product = await this.productRepository.findByIdWithRelations(dto.productId, tenantId)
    if (!product) {
      throw new NotFoundException('Product not found')
    }

    // Determine absolute quantity and direction
    const absQty = Math.abs(dto.quantity)
    const isIncrement = [
      InventoryTransactionType.PURCHASE,
      InventoryTransactionType.RETURN,
      InventoryTransactionType.INITIAL_BALANCE,
      InventoryTransactionType.TRANSFER_IN,
      InventoryTransactionType.RESERVATION_CANCEL,
    ].includes(dto.type) || (dto.type === InventoryTransactionType.ADJUSTMENT && dto.quantity > 0)

    const isDecrement = [
      InventoryTransactionType.SALE,
      InventoryTransactionType.TRANSFER_OUT,
      InventoryTransactionType.DAMAGE,
      InventoryTransactionType.RESERVATION,
    ].includes(dto.type) || (dto.type === InventoryTransactionType.ADJUSTMENT && dto.quantity < 0)

    // Calculate signed quantity for ledger balance
    const signedQty = isIncrement ? absQty : -absQty

    // Use transaction manager if provided
    const internalExecute = async (em: any) => {
      // 1. Get current balance from ledger
      const currentBalance = await this.repository.getLatestBalanceAfter(
        dto.productId,
        dto.variantId || null,
        dto.warehouseId || '',
        tenantId,
        em,
      )

      const balanceAfter = Number(currentBalance) + signedQty

      // 2. Dual-Write: Update legacy stock column
      // CRITICAL: We only update legacy stock for RESERVATION (soft-deduct) 
      // or physical movements that WERE NOT previously reserved.
      // For Phase 5, if it's a SALE at shipment, we assume it was already reserved at order.
      // So we skip legacy update for SALE if it's originating from an Order.

      // Dual-Write to Legacy Columns (Modified for Phase 5)
      const isReservation = dto.type === InventoryTransactionType.RESERVATION
      const isReservationCancel = dto.type === InventoryTransactionType.RESERVATION_CANCEL
      const isSaleFromOrder = dto.type === InventoryTransactionType.SALE && dto.referenceType === InventoryTransactionReferenceType.ORDER

      if (dto.variantId) {
        if (isReservation) {
          await this.variantRepository.decrementStock(dto.variantId, tenantId, absQty, em)
          await this.variantRepository.incrementReservedStock(dto.variantId, tenantId, absQty, em)
        } else if (isReservationCancel) {
          await this.variantRepository.incrementStock(dto.variantId, tenantId, absQty, em)
          await this.variantRepository.decrementReservedStock(dto.variantId, tenantId, absQty, em)
        } else if (isSaleFromOrder) {
          await this.variantRepository.decrementReservedStock(dto.variantId, tenantId, absQty, em)
        } else {
          // Standard movement
          if (isIncrement) {
            await this.variantRepository.incrementStock(dto.variantId, tenantId, absQty, em)
          } else if (isDecrement) {
            await this.variantRepository.decrementStock(dto.variantId, tenantId, absQty, em)
          }
        }
      } else {
        if (isReservation) {
          await this.productRepository.decrementStock(product.id, tenantId, absQty, em)
          await this.productRepository.incrementReservedStock(product.id, tenantId, absQty, em)
        } else if (isReservationCancel) {
          await this.productRepository.incrementStock(product.id, tenantId, absQty, em)
          await this.productRepository.decrementReservedStock(product.id, tenantId, absQty, em)
        } else if (isSaleFromOrder) {
          await this.productRepository.decrementReservedStock(product.id, tenantId, absQty, em)
        } else {
          // Standard movement
          if (isIncrement) {
            await this.productRepository.incrementStock(product.id, tenantId, absQty, em)
          } else if (isDecrement) {
            await this.productRepository.decrementStock(product.id, tenantId, absQty, em)
          }
        }
      }

      // 3. Calculate COGS for Sales
      let cogsAmount = 0
      if (dto.type === InventoryTransactionType.SALE) {
        cogsAmount = await this.cogsService.calculateAndConsumeCogs(
          dto.productId,
          dto.variantId || null,
          dto.warehouseId || '',
          absQty,
          ctx,
          em,
        )
      }

      // 4. Write to Ledger
      const ledgerEntry = await this.repository.createAndSave(
        {
          ...dto,
          quantity: signedQty,
          balanceAfter,
          remainingQuantity: isIncrement ? absQty : 0,
          cogsAmount,
        },
        ctx,
        em,
      )

      // 5. Post to Finance
      await this.accountingIntegration.postInventoryMovement(ledgerEntry, ctx, em)

      return ledgerEntry
    }

    const transaction = manager ? await internalExecute(manager) : await internalExecute(null)

    // Invalidate inventory caches
    await this.cacheService.delCache(`inventory:list`, tenantId)
    await this.cacheService.delCache(`inventory:summary`, tenantId)

    return transaction
  }

  async findAllLedgerEntries(
    ctx: RequestContextDto,
    paginationDto: PaginationDto,
    type?: InventoryTransactionType,
  ): Promise<{
    items: InventoryLedgerEntity[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    this.logger.log(`${this.findAllLedgerEntries.name} Service Called`)
    const tenantId = ctx.tenantId
    const { page = 1, limit = 20, q: search } = paginationDto
    const cacheKey = `inventory:ledger:p${page}:l${limit}:q${search || ''}:t${type || ''}`

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

  async findByProductLedgerEntries(
    productId: string,
    ctx: RequestContextDto,
  ): Promise<InventoryLedgerEntity[]> {
    this.logger.log(`${this.findByProductLedgerEntries.name} Service Called`)
    const tenantId = ctx.tenantId
    return await this.repository.findByProduct(productId, tenantId)
  }

  /**
   * Returns stock summary across all products.
   * Still uses product.stock as source of truth for Phase 2.
   */
  async getStockSummary(ctx: RequestContextDto): Promise<any[]> {
    this.logger.log(`${this.getStockSummary.name} Service Called`)
    const tenantId = ctx.tenantId

    return this.cacheService.rememberCache(
      `inventory:summary`,
      async () => {
        const [products] = await this.productRepository.findAllWithFilters(
          { limit: 1000 },
          tenantId,
        )

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
      600,
      tenantId,
    )
  }
}
