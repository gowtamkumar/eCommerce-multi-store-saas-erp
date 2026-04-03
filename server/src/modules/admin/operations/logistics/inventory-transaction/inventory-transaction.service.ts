import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { CreateInventoryTransactionDto } from '@/modules/admin/operations/logistics/inventory-transaction/dto/create-inventory-transaction.dto'
import { InventoryTransactionRepository } from './inventory-transaction.repository'
import { ProductRepository } from '@/modules/admin/catalog/product/product.repository'
import { ProductVariantRepository } from '@/modules/admin/catalog/product/variant.repository'
import { InventoryTransactionEntity } from './entities/inventory-transaction.entity'

@Injectable()
export class InventoryTransactionService {
  private readonly logger = new Logger(InventoryTransactionService.name)

  constructor(
    private readonly repository: InventoryTransactionRepository,
    private readonly productRepository: ProductRepository,
    private readonly variantRepository: ProductVariantRepository,
  ) { }

  async createInventoryTransaction(
    dto: CreateInventoryTransactionDto,
    tenantId: string,
    manager?: any,
  ): Promise<InventoryTransactionEntity> {
    this.logger.log(`${this.createInventoryTransaction.name} Service Called`)

    const product = await this.productRepository.findByIdWithRelations(dto.productId, tenantId)

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    // Update static stock fields (cache) atomically
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

    return await this.repository.createAndSave(dto, tenantId, manager)
  }

  async findAllInventoryTransactions(tenantId: string): Promise<InventoryTransactionEntity[]> {
    this.logger.log(`${this.findAllInventoryTransactions.name} Service Called`)
    return await this.repository.findByTenant(tenantId)
  }

  async findByProductInventoryTransactions(productId: string, tenantId: string): Promise<InventoryTransactionEntity[]> {
    this.logger.log(`${this.findByProductInventoryTransactions.name} Service Called`)
    return await this.repository.findByProduct(productId, tenantId)
  }

  async getStockSummaryInventoryTransactions(tenantId: string): Promise<any[]> {
    this.logger.log(`${this.getStockSummaryInventoryTransactions.name} Service Called`)
    const products: any = await this.repository.findByTenant(tenantId)

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
          ? product.variants.map((v) => ({
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
  }
}
