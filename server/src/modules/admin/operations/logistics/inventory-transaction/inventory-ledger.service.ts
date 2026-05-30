import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
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
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'

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
    private readonly notificationService: NotificationService,
  ) {}

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
    const isIncrement =
      [
        InventoryTransactionType.PURCHASE,
        InventoryTransactionType.RETURN,
        InventoryTransactionType.INITIAL_BALANCE,
        InventoryTransactionType.TRANSFER_IN,
        InventoryTransactionType.RESERVATION_CANCEL,
      ].includes(dto.type) ||
      (dto.type === InventoryTransactionType.ADJUSTMENT && dto.quantity > 0)

    const isDecrement =
      [
        InventoryTransactionType.SALE,
        InventoryTransactionType.TRANSFER_OUT,
        InventoryTransactionType.DAMAGE,
        InventoryTransactionType.RESERVATION,
      ].includes(dto.type) ||
      (dto.type === InventoryTransactionType.ADJUSTMENT && dto.quantity < 0)

    // Calculate signed quantity for ledger balance
    const signedQty = isIncrement ? absQty : -absQty

    // Use transaction manager if provided
    const internalExecute = async (em: any) => {
      // 1. Get current balance from ledger
      const currentBalance = await this.repository.getLatestBalanceAfter(
        dto.productId,
        dto.variantId || null,
        dto.warehouseId || null,
        tenantId,
        em,
      )

      const balanceAfter = Number(currentBalance) + signedQty

      // 3. Calculate COGS for Sales
      let cogsAmount = 0
      if (dto.type === InventoryTransactionType.SALE) {
        cogsAmount = await this.cogsService.calculateAndConsumeCogs(
          dto.productId,
          dto.variantId || null,
          dto.warehouseId || null,
          absQty,
          ctx,
          em,
        )
      }

      // 3.5 Recalculate Average Cost for PURCHASE (Procurement Intake)
      if (dto.type === InventoryTransactionType.PURCHASE && dto.unitCost) {
        const currentStock = Math.max(0, Number(currentBalance))
        const incomingQty = absQty
        const incomingCost = Number(dto.unitCost)

        if (currentStock + incomingQty > 0) {
          if (dto.variantId) {
            const variant = await this.variantRepository.findById(dto.variantId, tenantId, em)
            if (variant) {
              const currentAvgCost = Number(variant.averageCost || 0)
              const newAvgCost =
                (currentStock * currentAvgCost + incomingQty * incomingCost) /
                (currentStock + incomingQty)
              await this.variantRepository.updateAverageCost(
                dto.variantId,
                tenantId,
                newAvgCost,
                em,
              )
            }
          } else {
            const currentAvgCost = Number(product.averageCost || 0)
            const newAvgCost =
              (currentStock * currentAvgCost + incomingQty * incomingCost) /
              (currentStock + incomingQty)
            await this.productRepository.updateAverageCost(product.id, tenantId, newAvgCost, em)
          }
        }
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
    await Promise.all([
      this.cacheService.delCacheByPattern('inventory:ledger*', tenantId),
      this.cacheService.delCacheByPattern('inventory:summary*', tenantId),
      this.cacheService.delCacheByPattern('dashboard*', tenantId),
    ])

    // Trigger Low Stock / Out of Stock Warnings
    try {
      const newGlobalStock = await this.repository.getLiveStock(dto.productId, dto.variantId || null, tenantId)
      const currentGlobalStock = newGlobalStock - signedQty

      let threshold = product.lowStockThreshold ?? 5
      let skuText = ''
      if (dto.variantId && product.variants) {
        const variant = product.variants.find((v) => v.id === dto.variantId)
        if (variant) {
          threshold = variant.lowStockThreshold ?? threshold
          skuText = variant.sku ? ` (${variant.sku})` : ''
        }
      }

      // Out of Stock Transition
      if (currentGlobalStock > 0 && newGlobalStock <= 0) {
        await this.notificationService.createNotification({
          title: 'Product Out of Stock',
          message: `Product "${product.name}"${skuText} is completely out of stock!`,
          type: 'DANGER',
          link: `/admin/products/${product.id}`,
          userId: null as any,
        }, tenantId)
      }
      // Low Stock Transition
      else if (currentGlobalStock > threshold && newGlobalStock <= threshold && newGlobalStock > 0) {
        await this.notificationService.createNotification({
          title: 'Low Stock Alert',
          message: `Product "${product.name}"${skuText} is low on stock. Current quantity: ${newGlobalStock} (Threshold: ${threshold}).`,
          type: 'WARNING',
          link: `/admin/products/${product.id}`,
          userId: null as any,
        }, tenantId)
      }
    } catch (notifError) {
      this.logger.error(`Failed to trigger inventory notification: ${notifError.message}`)
    }

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
  async getStockSummary(ctx: RequestContextDto, warehouseId?: string): Promise<any[]> {
    this.logger.log(`${this.getStockSummary.name} Service Called`)
    const tenantId = ctx.tenantId

    const cacheKey = `inventory:summary:${warehouseId || 'global'}`

    return this.cacheService.rememberCache(
      cacheKey,
      async () => {
        const [products] = await this.productRepository.findAllWithFilters(
          { limit: 1000 },
          tenantId,
        )

        const sums = await this.repository.getStockSums(tenantId, warehouseId)
        const stockMap = new Map<string, number>()
        sums.forEach((item: any) => {
          const key = item.variantId ? `${item.productId}:${item.variantId}` : item.productId
          stockMap.set(key, Number(item.sum || 0))
        })

        return products.map((product) => {
          const hasVariants = product.variants && product.variants.length > 0

          if (hasVariants) {
            product.variants.forEach((v) => {
              v.stock = stockMap.get(`${product.id}:${v.id}`) || 0
            })
          } else {
            product.stock = stockMap.get(product.id) || 0
          }

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

  // =========================================================================
  // STOCK TRANSFERS
  // =========================================================================

  /**
   * Moves stock between two warehouses atomically via paired ledger entries.
   * TRANSFER_OUT deducts from source; TRANSFER_IN credits destination.
   */
  async createStockTransfer(
    dto: {
      productId: string
      variantId?: string
      sourceWarehouseId: string
      destinationWarehouseId: string
      quantity: number
      remarks?: string
    },
    ctx: RequestContextDto,
  ): Promise<{ outEntry: InventoryLedgerEntity; inEntry: InventoryLedgerEntity }> {
    this.logger.log(`${this.createStockTransfer.name} Service Called`)

    const sourceStock = await this.repository.getLiveStock(
      dto.productId,
      dto.variantId || null,
      ctx.tenantId,
      dto.sourceWarehouseId,
    )

    if (sourceStock < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock in source warehouse. Only ${sourceStock} items available.`,
      )
    }

    const transferRef = `XFER-${Date.now()}`

    const outEntry = await this.createLedgerEntry(
      {
        productId: dto.productId,
        variantId: dto.variantId,
        warehouseId: dto.sourceWarehouseId,
        type: InventoryTransactionType.TRANSFER_OUT,
        quantity: dto.quantity,
        referenceType: InventoryTransactionReferenceType.STOCK_TRANSFER,
        referenceId: transferRef,
        remarks: dto.remarks || `Transfer to warehouse ${dto.destinationWarehouseId}`,
      },
      ctx,
    )

    const inEntry = await this.createLedgerEntry(
      {
        productId: dto.productId,
        variantId: dto.variantId,
        warehouseId: dto.destinationWarehouseId,
        type: InventoryTransactionType.TRANSFER_IN,
        quantity: dto.quantity,
        referenceType: InventoryTransactionReferenceType.STOCK_TRANSFER,
        referenceId: transferRef,
        remarks: dto.remarks || `Transfer from warehouse ${dto.sourceWarehouseId}`,
      },
      ctx,
    )

    return { outEntry, inEntry }
  }

  // =========================================================================
  // CYCLE COUNT
  // =========================================================================

  /**
   * Processes a physical stock count. Each line compares the counted qty
   * against the live ledger balance and fires an ADJUSTMENT entry for the delta.
   */
  async createCycleCount(
    dto: {
      countRef: string
      warehouseId: string
      lines: Array<{
        productId: string
        variantId?: string
        countedQty: number
        remarks?: string
      }>
    },
    ctx: RequestContextDto,
  ): Promise<{ processed: number; adjustments: InventoryLedgerEntity[] }> {
    this.logger.log(`${this.createCycleCount.name} Service Called`)

    const adjustments: InventoryLedgerEntity[] = []

    for (const line of dto.lines) {
      const liveStock = await this.repository.getLiveStock(
        line.productId,
        line.variantId || null,
        ctx.tenantId,
        dto.warehouseId,
      )

      const delta = Number(line.countedQty) - Number(liveStock)

      if (delta !== 0) {
        const entry = await this.createLedgerEntry(
          {
            productId: line.productId,
            variantId: line.variantId,
            warehouseId: dto.warehouseId,
            type: InventoryTransactionType.ADJUSTMENT,
            quantity: delta, // positive = stock-in, negative = stock-out
            referenceType: InventoryTransactionReferenceType.CYCLE_COUNT,
            referenceId: dto.countRef,
            remarks: line.remarks || `Cycle count ${dto.countRef}: system ${liveStock} → counted ${line.countedQty}`,
          },
          ctx,
        )
        adjustments.push(entry)
      }
    }

    return { processed: dto.lines.length, adjustments }
  }

  async getGlobalLiveStock(
    productId: string,
    variantId: string | null,
    tenantId: string,
    manager?: any,
  ): Promise<number> {
    return await this.repository.getLiveStock(productId, variantId, tenantId, null, manager)
  }

  async getLiveStock(
    productId: string,
    variantId: string | null,
    tenantId: string,
    warehouseId?: string | null,
    manager?: any,
  ): Promise<number> {
    return await this.repository.getLiveStock(productId, variantId, tenantId, warehouseId, manager)
  }

  async getStockSums(tenantId: string, warehouseId?: string): Promise<any[]> {
    return await this.repository.getStockSums(tenantId, warehouseId)
  }
}
