import { RequestContextDto } from '@/common/dto/request-context.dto'
import { DiscountType } from '@/common/enums/discount-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { DiscountStrategyFactory } from '@/common/strategies/discount/Discount-strategy.factory'
import { FaqRepository } from '@/modules/admin/content/faq/faq.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { PromotionService } from '@/modules/admin/sales/promotion/services/promotion.service'
import { InjectQueue } from '@nestjs/bullmq'
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Queue } from 'bullmq'
import { DataSource, Not } from 'typeorm'
import { PromotionTargetType } from '../../../sales/promotion/enums/promotion-target-type.enum'
import { BrandRepository } from '../../brand/brand.repository'
import { CreateProductDto } from '../dto/create-product.dto'
import { FilterProductDto } from '../dto/filter-product.dto'
import { UpdateProductDto } from '../dto/update-product.dto'
import { ProductEntity } from '../entities/product.entity'
import { ProductVariantEntity } from '../entities/variant.entity'
import { ProductAttributeRepository } from '../repositories/attribute.repository'
import { ProductRepository } from '../repositories/product.repository'
import { ProductVariantRepository } from '../repositories/variant.repository'

type AugmentedProduct = ProductEntity & { applicablePromotions?: any[] }

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name)

  constructor(
    private productRepository: ProductRepository,
    private faqRepository: FaqRepository,
    private attributeRepository: ProductAttributeRepository,
    private variantRepository: ProductVariantRepository,
    private brandRepository: BrandRepository,
    private cache: CacheService,
    private readonly inventoryService: InventoryLedgerService,
    private readonly promotionService: PromotionService,
    private readonly dataSource: DataSource,
    @InjectQueue('product') private readonly productQueue: Queue,
  ) { }

  private async attachPromotions(product: any, ctx: RequestContextDto): Promise<AugmentedProduct> {
    this.logger.log(`${this.attachPromotions.name} Service Called`)
    if (!product) return product
    const tenantId = ctx.tenantId
    try {
      const activePromos = await this.promotionService.findActivePromotions(ctx)
      if (!activePromos || activePromos.length === 0) return product

      const applicablePromotions = activePromos.filter((promo) => {
        if (
          promo.targetType === PromotionTargetType.SPECIFIC_PRODUCT &&
          promo.targetId === product.id
        )
          return true
        if (
          promo.targetType === PromotionTargetType.SPECIFIC_CATEGORY &&
          (promo.targetId === product.categoryId ||
            (product.category && promo.targetId === product.category.id))
        )
          return true
        if (
          promo.targetType === PromotionTargetType.SPECIFIC_BRAND &&
          promo.targetId === product.brandId
        )
          return true
        if (promo.targetType === PromotionTargetType.ENTIRE_ORDER) return true
        return false
      })

      const defaultVariant = (product.variants || []).find((v: any) => v.isDefault)
      const basePrice = Number(defaultVariant?.price ?? product.price ?? 0)
      const images = defaultVariant?.images?.length > 0 ? defaultVariant.images : product.images

      const originalDiscountType = product.discountType || DiscountType.FIXED
      const originalRawDiscount = Number(product.discountAmount || 0)
      const originalDiscountStrategy = DiscountStrategyFactory.create(
        originalDiscountType as string,
      )
      const originalDiscountValue = originalDiscountStrategy.calculate(
        basePrice,
        originalRawDiscount,
      )

      let bestDiscountValue = originalDiscountValue
      let finalDiscountAmount = originalRawDiscount
      let finalDiscountType = originalDiscountType as DiscountType

      applicablePromotions.forEach((promo) => {
        const promoDiscountStrategy = DiscountStrategyFactory.create(promo.promotionType as string)
        const calcDiscount = promoDiscountStrategy.calculate(basePrice, Number(promo.value))
        if (calcDiscount > bestDiscountValue) {
          bestDiscountValue = calcDiscount
          finalDiscountAmount = Number(promo.value)
          finalDiscountType = promo.promotionType as DiscountType
        }
      })

      return {
        ...product,
        applicablePromotions,
        discountAmount: finalDiscountAmount,
        discountType: finalDiscountType,
        images: images,
        price: basePrice, // Optional: ensure the serialized price is also correct
      } as AugmentedProduct
    } catch (error) {
      console.error('Error attaching promotions', error)
      return product
    }
  }

  private async attachPromotionsMany(
    products: any[],
    ctx: RequestContextDto,
  ): Promise<AugmentedProduct[]> {
    this.logger.log(`${this.attachPromotionsMany.name} Service Called`)
    if (!products || products.length === 0) return products

    try {
      const activePromos = await this.promotionService.findActivePromotions(ctx)
      if (!activePromos || activePromos.length === 0) return products

      // Cache strategies to avoid repeated instantiation
      const strategies: Record<string, any> = {}

      return products.map((product) => {
        const applicablePromotions = activePromos.filter((promo) => {
          const type = promo.targetType
          const id = promo.targetId

          if (type === PromotionTargetType.ENTIRE_ORDER) return true
          if (type === PromotionTargetType.SPECIFIC_PRODUCT && id === product.id) return true
          if (
            type === PromotionTargetType.SPECIFIC_CATEGORY &&
            (id === product.categoryId || id === product.category?.id)
          )
            return true
          if (type === PromotionTargetType.SPECIFIC_BRAND && id === product.brandId) return true

          return false
        })

        const defaultVariant = (product.variants || []).find((v: any) => v.isDefault)
        const basePrice = Number(defaultVariant?.price ?? product.price ?? 0)
        const images = defaultVariant?.images?.length > 0 ? defaultVariant.images : product.images
        const originalDiscountType = product.discountType || DiscountType.FIXED
        const originalRawDiscount = Number(product.discountAmount || 0)

        if (!strategies[originalDiscountType]) {
          strategies[originalDiscountType] = DiscountStrategyFactory.create(originalDiscountType)
        }

        const originalDiscountValue = strategies[originalDiscountType].calculate(
          basePrice,
          originalRawDiscount,
        )

        let bestDiscountValue = originalDiscountValue
        let finalDiscountAmount = originalRawDiscount
        let finalDiscountType = originalDiscountType as DiscountType

        applicablePromotions.forEach((promo) => {
          const pType = promo.promotionType as string
          if (!strategies[pType]) {
            strategies[pType] = DiscountStrategyFactory.create(pType)
          }
          const calcDiscount = strategies[pType].calculate(basePrice, Number(promo.value))
          if (calcDiscount > bestDiscountValue) {
            bestDiscountValue = calcDiscount
            finalDiscountAmount = Number(promo.value)
            finalDiscountType = promo.promotionType as DiscountType
          }
        })

        return {
          ...(product instanceof ProductEntity ? (product as ProductEntity) : product),
          applicablePromotions,
          discountAmount: finalDiscountAmount,
          discountType: finalDiscountType,
          images: images,
          price: basePrice, // Ensure the serialized price is correct
        } as AugmentedProduct
      })
    } catch (error) {
      this.logger.error('Error attaching promotions many', error)
      return products
    }
  }

  private generateSku(productSlug: string, combination: Record<string, string>): string {
    const values = Object.values(combination)
      .map((v) =>
        String(v)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, ''),
      )
      .join('-')
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const base = values
      ? `${productSlug.toUpperCase()}-${values.toUpperCase()}`
      : productSlug.toUpperCase()
    return `${base}-${suffix}`
  }

  async findAllProducts(
    ctx: RequestContextDto,
    filterDto: FilterProductDto = { page: 1, limit: 5 },
  ): Promise<{ products: AugmentedProduct[]; total: number }> {
    this.logger.log(`${this.findAllProducts.name} Service Called`)
    const tenantId = ctx.tenantId

    // Build a deterministic cache key from the filter parameters to absorb
    // repeated identical requests (e.g. multiple users on the same category page).
    const filterKey = JSON.stringify(filterDto)
    const cacheKey = `products:list:${filterKey}`

    return this.cache.rememberCache(
      cacheKey,
      async () => {
        const [products, total] = await this.productRepository.findAllWithFilters(
          filterDto,
          tenantId,
        )
        const productsWithPromotions = await this.attachPromotionsMany(products, ctx)
        return { products: productsWithPromotions, total }
      },
      60, // 60-second TTL — short enough to reflect stock/price updates
      tenantId,
    )
  }

  async getFilterOptions(ctx: RequestContextDto, categoryId?: string): Promise<any> {
    this.logger.log(`${this.getFilterOptions.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = `products:filter-options:${categoryId || 'all'}`

    return this.cache.rememberCache(
      cacheKey,
      async () => {
        const [prices, brands, variants] = await Promise.all([
          this.productRepository.getPriceRange(tenantId, categoryId),
          this.brandRepository.findBrandsForProducts(tenantId, categoryId),
          this.variantRepository.findCombinationsForProducts(tenantId, categoryId),
        ])

        const attributeMap: Record<string, Set<string>> = {}
        for (const v of variants) {
          if (v.combination) {
            for (const [key, value] of Object.entries(v.combination)) {
              if (!attributeMap[key]) attributeMap[key] = new Set()
              attributeMap[key].add(value as string)
            }
          }
        }

        const formattedAttributes = Object.entries(attributeMap).map(([name, values]) => ({
          name,
          values: Array.from(values),
        }))

        return {
          priceRange: {
            min: Number(prices?.min || 0),
            max: Number(prices?.max || 0),
          },
          brands,
          attributes: formattedAttributes,
        }
      },
      300, // 5 minutes
      tenantId,
    )
  }

  async findBySlugProduct(slug: string, ctx: RequestContextDto): Promise<ProductEntity> {
    this.logger.log(`${this.findBySlugProduct.name} Service Called`)
    const tenantId = ctx.tenantId
    const product = await this.productRepository.findBySlugWithRelations(slug, tenantId)

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    return await this.attachPromotions(product, ctx)
  }

  async findLatestProducts(
    ctx: RequestContextDto,
    limit: number = 10,
  ): Promise<AugmentedProduct[]> {
    this.logger.log(`${this.findLatestProducts.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = `products:latest:${limit}`

    return this.cache.rememberCache(
      cacheKey,
      async () => {
        const products = await this.productRepository.findLatestProducts(tenantId, limit)
        return await this.attachPromotionsMany(products, ctx)
      },
      300, // 5 minutes
      tenantId,
    )
  }

  async findOneProduct(id: string, ctx: RequestContextDto): Promise<AugmentedProduct> {
    this.logger.log(`${this.findOneProduct.name} Service Called`)
    const tenantId = ctx.tenantId
    const cacheKey = `product:${id}`

    // Use rememberCache for consistent error handling and atomic get/set
    const product = await this.cache.rememberCache(
      cacheKey,
      async () => {
        const p = await this.productRepository.findByIdWithRelations(id, tenantId)
        if (!p) throw new NotFoundException('Product not found')
        return p
      },
      300, // 5 minutes
      tenantId,
    )

    return await this.attachPromotions(product, ctx)
  }

  async createProduct(
    createProductDto: CreateProductDto,
    ctx: RequestContextDto,
  ): Promise<ProductEntity> {
    this.logger.log(`${this.createProduct.name} Service Called`)
    const tenantId = ctx.tenantId

    let poData: any = null

    const savedProduct = await this.dataSource.transaction(async (manager) => {
      const existing = await this.productRepository.findBySlug(createProductDto.slug, tenantId)
      if (existing) throw new ConflictException('Product with this slug already exists')

      const { faqs, attributes, variants, ...productData } = createProductDto
      
      // ERP FIX: Stock must always start at 0 during creation. 
      // Stock should only enter the system via PO/GRN or Stock Adjustment.
      productData.stock = 0;
      
      const product = await this.productRepository.createAndSave(productData, ctx)

      if (faqs && faqs.length > 0) {
        await this.faqRepository.saveMultiple(faqs, product.id, ctx, manager)
      }

      if (attributes && attributes.length > 0) {
        await this.attributeRepository.saveMultiple(attributes, product.id, ctx, manager)
      }

      if (variants && variants.length > 0) {
        for (const variantDto of variants) {
          // ERP FIX: Force variant stock to 0 as well
          variantDto.stock = 0;

          const savedVariant = await this.variantRepository.saveNewVariant(
            variantDto,
            product.id,
            ctx,
            manager,
          )

          // If this variant is default, ensure others are not (though handled in update usually)
          if (variantDto.isDefault) {
            await manager.update(
              ProductVariantEntity,
              { productId: product.id, id: Not(savedVariant.id) },
              { isDefault: false },
            )
          }
        }
      }

      return product
    })

    return await this.findOneProduct(savedProduct.id, ctx)
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    ctx: RequestContextDto,
  ): Promise<AugmentedProduct> {
    this.logger.log(`${this.updateProduct.name} Service Called`)
    const tenantId = ctx.tenantId

    let poData: any = null

    await this.dataSource.transaction(async (manager) => {
      // 1. Fetch Fresh Product (bypassing potentially stale cache for update)
      const product = await this.productRepository.findByIdWithRelations(id, tenantId)
      if (!product) throw new NotFoundException('Product not found')

      // 2. Slug Validation
      if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
        const existing = await this.productRepository.findBySlug(updateProductDto.slug, tenantId)
        if (existing) throw new ConflictException('Product with this slug already exists')
      }

      const { faqs, attributes, variants, ...productData } = updateProductDto

      // ERP FIX: Prevent manual stock updates during product edit.
      // Stock can only be changed via Procurement or Inventory Adjustment.
      delete (productData as any).stock;

      // 4. Update Base Product
      await this.productRepository.updateAndSave(product, productData, manager)

      // 5. Update FAQs
      if (faqs) {
        await this.faqRepository.deleteByProductId(product.id, tenantId, manager)
        if (faqs.length > 0) {
          await this.faqRepository.saveMultiple(faqs, product.id, ctx, manager)
        }
      }

      // 6. Update Attributes
      if (attributes) {
        await this.attributeRepository.deleteByProductId(product.id, tenantId, manager)
        if (attributes.length > 0) {
          await this.attributeRepository.saveMultiple(attributes, product.id, ctx, manager)
        }
      }

      // 7. Update Variants & Handle POs
      const poItems = []

      if (variants) {
        const existingVariants = await this.variantRepository.findByProductId(product.id, tenantId)
        const existingVariantIds = existingVariants.map((v) => v.id)

        const incomingVariantsWithId = variants.filter((v: any) => v.id)
        const incomingVariantIds = incomingVariantsWithId.map((v: any) => v.id)
        const newVariants = variants.filter((v: any) => !v.id)

        // 7a. Validate All Incoming SKUs (Unique within request)
        const skusInRequest = variants.filter((v: any) => v.sku).map((v: any) => v.sku)
        const uniqueSkusInRequest = new Set(skusInRequest)
        if (uniqueSkusInRequest.size !== skusInRequest.length) {
          throw new ConflictException('Duplicate SKUs found in the request')
        }

        // 7b. Delete Variants not present in the update (DO THIS FIRST to free up SKUs)
        const toDeleteIds = existingVariantIds.filter((dbId) => !incomingVariantIds.includes(dbId))
        if (toDeleteIds.length > 0) {
          await this.variantRepository.deleteByIds(toDeleteIds, manager)
        }

        // 7c. Handle Existing Variants
        for (const variantDto of incomingVariantsWithId) {
          if (variantDto.sku) {
            const duplicate = await this.variantRepository.findBySku(
              variantDto.sku,
              tenantId,
              manager,
              true,
            )
            if (duplicate && duplicate.productId !== product.id) {
              throw new ConflictException(
                `SKU ${variantDto.sku} is already used by another product`,
              )
            }
          }
          await this.variantRepository.saveExistingVariant(variantDto, product.id, ctx, manager)

          if (variantDto.isDefault) {
            await manager.update(
              ProductVariantEntity,
              { productId: product.id, tenantId, id: Not(variantDto.id) },
              { isDefault: false },
            )
          }
        }

        // 7d. Handle New Variants
        for (const variantDto of newVariants) {
          // Auto-generate SKU if missing
          if (!variantDto.sku) {
            variantDto.sku = this.generateSku(product.slug, variantDto.combination)
          }

          // Check for conflicts (including soft-deleted)
          const duplicate = await this.variantRepository.findBySku(
            variantDto.sku,
            tenantId,
            manager,
            true,
          )
          if (duplicate) {
            if (duplicate.productId !== product.id) {
              throw new ConflictException(
                `Variant with SKU ${variantDto.sku} already exists in another product`,
              )
            } else {
              // If it belongs to same product but was soft-deleted, we might have a problem with the unique index
              // unless we use the existing ID. But here we assume it's a conflict.
              throw new ConflictException(
                `SKU ${variantDto.sku} conflict with a deleted variant. Please use a different SKU.`,
              )
            }
          }

          const savedVariant = await this.variantRepository.saveNewVariant(
            variantDto,
            product.id,
            ctx,
            manager,
          )

          if (variantDto.isDefault) {
            await manager.update(
              ProductVariantEntity,
              { productId: product.id, tenantId, id: Not(savedVariant.id) },
              { isDefault: false },
            )
          }

          if (variantDto.stock > 0) {
            if (product.supplierId) {
              poItems.push({
                productId: product.id,
                variantId: savedVariant.id,
                quantity: variantDto.stock,
                unitPrice: variantDto.price || product.price,
              })
            } else {
              await this.variantRepository.incrementStock(
                savedVariant.id,
                tenantId,
                variantDto.stock,
                manager,
              )
            }
          }
        }
      } else {
        // If NO variants, check if base stock was updated and needs a PO
        if (productData.stock > 0 && product.supplierId) {
          poItems.push({
            productId: product.id,
            quantity: productData.stock,
            unitPrice: product.price,
          })
        }
      }

      // Prepare Background Job data if needed
      if (poItems.length > 0 && product.supplierId) {
        poData = {
          supplierId: product.supplierId,
          referenceNumber: `UPDATE_VAR_${product.slug.toUpperCase()}_${Date.now()}`,
          items: poItems,
        }
      }

      await this.cache.delCache(`product:${id}`, tenantId)
    })

    // Trigger background job AFTER transaction commits
    if (poData) {
      await this.productQueue.add('create-purchase-order', { ...poData, tenantId })
    }

    return await this.findOneProduct(id, ctx)
  }

  async removeProduct(
    id: string,
    ctx: RequestContextDto,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`${this.removeProduct.name} Service Called`)
    const tenantId = ctx.tenantId
    const product = await this.findOneProduct(id, ctx)
    await this.productRepository.removeProduct(product as any as ProductEntity)

    await this.cache.delCache(`product:${id}`, tenantId)

    return { success: true, message: 'Product deleted successfully' }
  }

  async decrementStock(
    productId: string,
    quantity: number,
    ctx: RequestContextDto,
    variantId?: string,
  ): Promise<any> {
    this.logger.log(`${this.decrementStock.name} Service Called`)
    const tenantId = ctx.tenantId
    return await this.inventoryService.createLedgerEntry(
      {
        productId,
        variantId,
        quantity,
        type: InventoryTransactionType.SALE,
        referenceType: InventoryTransactionReferenceType.STOCK_ADJUSTMENT,
      },
      ctx,
    )
  }

  async findAllProductsCrossTenant(): Promise<ProductEntity[]> {
    this.logger.log(`${this.findAllProductsCrossTenant.name} Service Called`)
    return await this.productRepository.findAllCrossTenant()
  }

  async countByTenant(ctx: RequestContextDto): Promise<number> {
    this.logger.log(`${this.countByTenant.name} Service Called`)
    const tenantId = ctx.tenantId
    return await this.productRepository.countProducts(tenantId)
  }

  async productOverview(): Promise<any> {
    this.logger.log(`${this.productOverview.name} Service Called`)
    return await this.productRepository.getOverviewStats()
  }
}
