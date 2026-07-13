import { RequestContextDto } from '@/common/dto/request-context.dto'
import { DiscountType } from '@/common/enums/discount-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { DiscountStrategyFactory } from '@/common/strategies/discount/Discount-strategy.factory'
import { FaqRepository } from '@/modules/admin/content/faq/faq.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { InventoryLedgerService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-ledger.service'
import { PromotionService } from '@/modules/admin/sales/promotion/services/promotion.service'
import { StoreService } from '@/modules/system/store/store.service'
import { InjectQueue } from '@nestjs/bullmq'
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { Queue } from 'bullmq'
import { DataSource, Not } from 'typeorm'
import { StoreFeatureEntity } from '@/modules/system/store/entities/store-feature.entity'
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
import { generateEAN13, generateProductSku, generateVariantSku } from '../utils/catalog-id.util'
import { AiJobService } from '@/modules/admin/ai/services/ai-job.service'
import { AddonCatalogService } from '@/modules/system/addon-catalog/addon-catalog.service'
import { SuperAdminCrossStoreRepository } from '@/modules/system/super-admin/repositories/super-admin-cross-store.repository'
import { isStoreAiAutomationReady } from '@/common/utils/store-ai-automation.util'
import { normalizeStoreAiConfig } from '@/modules/system/store/utils/store-ai.util'
import { CategoryRepository } from '../../category/category.repository'
import {
  ImportProductsDto,
  ImportProductsResultDto,
} from '../dto/import-products.dto'
import {
  IMPORT_DESCRIPTION_PLACEHOLDER,
  isMissingImportedDescription,
  normalizeImportStatus,
  slugifyProductName,
} from '../utils/product-import.util'
import { randomUUID } from 'crypto'
import { ProductEmbeddingService } from './product-embedding.service'

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
    private readonly storeService: StoreService,
    private readonly dataSource: DataSource,
    private readonly addonCatalogService: AddonCatalogService,
    @InjectQueue('product') private readonly productQueue: Queue,
    private readonly crossStoreRepository: SuperAdminCrossStoreRepository,
    private readonly productEmbeddingService: ProductEmbeddingService,
    private readonly aiJobService: AiJobService,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  private async assertProductQuotaAvailable(storeId: string): Promise<void> {
    const store = await this.storeService.findOneStores(storeId)
    let maxProducts = Number(store.subscriptionPlan?.maxProducts ?? 0)
    if (!Number.isFinite(maxProducts) || maxProducts <= 0) return

    const activeOverrides = await this.dataSource.getRepository(StoreFeatureEntity).find({
      where: { storeId, isEnabled: true },
    })

    // Load product addon definitions from DB dynamically (boost_unit === 'products')
    const productAddonDefs = (await this.addonCatalogService.findActive()).filter(
      (a) => a.boostUnit === 'products',
    )
    for (const override of activeOverrides) {
      for (const def of productAddonDefs) {
        if (override.featureSlug === def.slug || override.featureSlug.startsWith(def.slug + '_')) {
          maxProducts += def.boostValue
          break
        }
      }
    }

    const currentProducts = await this.productRepository.countByStore(storeId)
    if (currentProducts >= maxProducts) {
      throw new ForbiddenException({
        success: false,
        message: `Your current plan allows up to ${maxProducts} products. Upgrade your plan to add more products.`,
        quota: {
          resource: 'products',
          limit: maxProducts,
          current: currentProducts,
        },
      })
    }
  }

  private async attachPromotions(product: any, ctx: RequestContextDto): Promise<AugmentedProduct> {
    this.logger.log(`${this.attachPromotions.name} Service Called`)
    if (!product) return product
    const storeId = ctx.storeId
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

  // SKU & Barcode generation is handled by the shared utility:
  // server/src/modules/admin/catalog/product/utils/catalog-id.util.ts

  private async populateProductsStock(products: any[], storeId: string): Promise<any[]> {
    if (!products || products.length === 0) return products
    try {
      // Only aggregate ledger rows for the products on this page, so the cost
      // scales with the result size instead of the entire store inventory.
      const productIds = products.map((p) => p.id).filter(Boolean)
      const sums = await this.inventoryService.getStockSumsByProductIds(storeId, productIds)
      const stockMap = new Map<string, number>()
      sums.forEach((item: any) => {
        const key = item.variantId ? `${item.productId}:${item.variantId}` : item.productId
        stockMap.set(key, Number(item.sum || 0))
      })

      products.forEach((product) => {
        const hasVariants = product.variants && product.variants.length > 0

        if (hasVariants) {
          product.variants.forEach((v: any) => {
            v.stock = stockMap.get(`${product.id}:${v.id}`) || 0
          })
          product.stock = product.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
        } else {
          product.stock = stockMap.get(product.id) || 0
        }
      })
    } catch (error) {
      this.logger.error('Failed to populate products stock from inventory ledger', error)
    }
    return products
  }

  async findAllProducts(
    ctx: RequestContextDto,
    filterDto: FilterProductDto = { page: 1, limit: 5 },
  ): Promise<{ products: AugmentedProduct[]; total: number }> {
    this.logger.log(`${this.findAllProducts.name} Service Called`)
    const storeId = ctx.storeId

    // Build a deterministic cache key from the filter parameters to absorb
    // repeated identical requests (e.g. multiple users on the same category page).
    const filterKey = JSON.stringify(filterDto)
    const cacheKey = `products:list:${filterKey}`

    return this.cache.rememberCache(
      cacheKey,
      async () => {
        const hasSearchQuery = Boolean(filterDto.q?.trim())
        const useHybrid =
          hasSearchQuery &&
          (await this.productEmbeddingService.canUseHybridSearch(storeId))

        if (useHybrid) {
          try {
            const result = await this.findAllProductsHybrid(storeId, filterDto, ctx)
            void this.productEmbeddingService.recordSearchEvent(storeId, 'hybrid', result.total)
            return result
          } catch (error) {
            this.logger.error(
              `Hybrid search failed for store ${storeId}. Falling back to keyword search.`,
              error,
            )
          }
        }

        const [products, total] = await this.productRepository.findAllWithFilters(
          filterDto,
          storeId,
        )
        const populated = await this.populateProductsStock(products, storeId)
        const productsWithPromotions = await this.attachPromotionsMany(populated, ctx)
        if (hasSearchQuery) {
          void this.productEmbeddingService.recordSearchEvent(storeId, 'keyword', total)
        }
        return { products: productsWithPromotions, total }
      },
      60, // 60-second TTL — short enough to reflect stock/price updates
      storeId,
    )
  }

  private async findAllProductsHybrid(
    storeId: string,
    filterDto: FilterProductDto,
    ctx: RequestContextDto,
  ): Promise<{ products: AugmentedProduct[]; total: number }> {
    const page = Math.max(1, parseInt(String(filterDto.page)) || 1)
    const limit = Math.max(1, parseInt(String(filterDto.limit)) || 10)

    const mergedIds = await this.productEmbeddingService.hybridSearchProductIds(
      storeId,
      filterDto,
    )
    const pageIds = mergedIds.slice((page - 1) * limit, page * limit)
    const products = await this.productRepository.findByIdsWithFilters(
      pageIds,
      filterDto,
      storeId,
    )
    const populated = await this.populateProductsStock(products, storeId)
    const productsWithPromotions = await this.attachPromotionsMany(populated, ctx)

    const [, keywordTotal] = await this.productRepository.findAllWithFilters(
      { ...filterDto, page: 1, limit: 1 },
      storeId,
    )

    return {
      products: productsWithPromotions,
      total: Math.max(keywordTotal, mergedIds.length),
    }
  }

  async getEmbeddingIndexStatus(storeId: string) {
    return this.productEmbeddingService.getIndexStatus(storeId)
  }

  async reindexProductEmbeddings(storeId: string) {
    return this.productEmbeddingService.reindexStoreCatalog(storeId)
  }

  async enqueueProductEmbeddingsReindex(storeId: string) {
    return this.productEmbeddingService.enqueueCatalogReindex(storeId)
  }

  async getFilterOptions(ctx: RequestContextDto, categoryId?: string): Promise<any> {
    this.logger.log(`${this.getFilterOptions.name} Service Called`)
    const storeId = ctx.storeId
    const cacheKey = `products:filter-options:${categoryId || 'all'}`

    return this.cache.rememberCache(
      cacheKey,
      async () => {
        const [prices, brands, variants] = await Promise.all([
          this.productRepository.getPriceRange(storeId, categoryId),
          this.brandRepository.findBrandsForProducts(storeId, categoryId),
          this.variantRepository.findCombinationsForProducts(storeId, categoryId),
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
      storeId,
    )
  }

  async findBySlugProduct(slug: string, ctx: RequestContextDto): Promise<ProductEntity> {
    this.logger.log(`${this.findBySlugProduct.name} Service Called`)
    const storeId = ctx.storeId
    const product = await this.productRepository.findBySlugWithRelations(slug, storeId)

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    const populated = await this.populateProductsStock([product], storeId)
    return await this.attachPromotions(populated[0], ctx)
  }

  async findLatestProducts(
    ctx: RequestContextDto,
    limit: number = 10,
  ): Promise<AugmentedProduct[]> {
    this.logger.log(`${this.findLatestProducts.name} Service Called`)
    const storeId = ctx.storeId
    const cacheKey = `products:latest:${limit}`

    return this.cache.rememberCache(
      cacheKey,
      async () => {
        const products = await this.productRepository.findLatestProducts(storeId, limit)
        const populated = await this.populateProductsStock(products, storeId)
        return await this.attachPromotionsMany(populated, ctx)
      },
      300, // 5 minutes
      storeId,
    )
  }

  async findOneProduct(id: string, ctx: RequestContextDto): Promise<AugmentedProduct> {
    this.logger.log(`${this.findOneProduct.name} Service Called`)
    const storeId = ctx.storeId

    // Do not cache single-product reads: stock is derived from the inventory ledger
    // and must stay fresh for admin review/edit (GRN/adjustments do not share this key).
    const product = await this.productRepository.findByIdWithRelations(id, storeId)
    if (!product) throw new NotFoundException('Product not found')

    const populated = await this.populateProductsStock([product], storeId)
    return await this.attachPromotions(populated[0], ctx)
  }

  async createProduct(
    createProductDto: CreateProductDto,
    ctx: RequestContextDto,
    options?: { skipAutomation?: boolean },
  ): Promise<ProductEntity> {
    this.logger.log(`${this.createProduct.name} Service Called`)
    const storeId = ctx.storeId

    let poData: any = null

    const savedProduct = await this.dataSource.transaction(async (manager) => {
      const existing = await this.productRepository.findBySlug(createProductDto.slug, storeId)
      if (existing) throw new ConflictException('Product with this slug already exists')
      await this.assertProductQuotaAvailable(storeId)

      const { faqs, attributes, variants, ...productData } = createProductDto

      // Auto-generate SKU & Barcode if missing/empty
      if (!productData.sku) {
        productData.sku = generateProductSku(productData.name || createProductDto.slug)
      }
      if (!productData.barcode) {
        productData.barcode = generateEAN13()
      }

      // ERP FIX: Stock must always start at 0 during creation.
      // Stock should only enter the system via PO/GRN or Stock Adjustment.
      productData.stock = 0

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
          variantDto.stock = 0

          // Auto-generate variant SKU & Barcode if missing
          if (!variantDto.sku) {
            variantDto.sku = generateVariantSku(product.slug, variantDto.combination)
          }
          if (!variantDto.barcode) {
            variantDto.barcode = generateEAN13()
          }

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

    await this.cache.delCacheByPattern('products:list:*', storeId)
    await this.cache.delCacheByPattern('products:latest:*', storeId)
    await this.cache.delCacheByPattern('products:filter-options:*', storeId)

    const created = await this.findOneProduct(savedProduct.id, ctx)
    void this.productEmbeddingService.scheduleProductEmbeddingSync(storeId, created.id)
    if (!options?.skipAutomation) {
      void this.aiJobService.enqueueProductCreatedAutomation(storeId, {
        productId: created.id,
        productName: created.name,
        category: created.category?.name,
        hasSeoFields: Boolean(created.metaTitle?.trim() || created.metaDescription?.trim()),
      })
    }
    return created
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    ctx: RequestContextDto,
  ): Promise<AugmentedProduct> {
    this.logger.log(`${this.updateProduct.name} Service Called`)
    const storeId = ctx.storeId

    let poData: any = null

    await this.dataSource.transaction(async (manager) => {
      // 1. Fetch Fresh Product (bypassing potentially stale cache for update)
      const product = await this.productRepository.findByIdWithRelations(id, storeId)
      if (!product) throw new NotFoundException('Product not found')

      // 2. Slug Validation
      if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
        const existing = await this.productRepository.findBySlug(updateProductDto.slug, storeId)
        if (existing) throw new ConflictException('Product with this slug already exists')
      }

      const { faqs, attributes, variants, ...productData } = updateProductDto

      // Auto-generate SKU & Barcode on update if they are explicitly cleared
      if (productData.hasOwnProperty('sku') && !productData.sku) {
        productData.sku = generateProductSku(productData.name || product.name)
      }
      if (productData.hasOwnProperty('barcode') && !productData.barcode) {
        productData.barcode = generateEAN13()
      }

      // ERP FIX: Prevent manual stock updates during product edit.
      // Stock can only be changed via Procurement or Inventory Adjustment.
      delete (productData as any).stock

      // 4. Update Base Product
      await this.productRepository.updateAndSave(product, productData, manager)

      // 5. Update FAQs
      if (faqs) {
        await this.faqRepository.deleteByProductId(product.id, storeId, manager)
        if (faqs.length > 0) {
          await this.faqRepository.saveMultiple(faqs, product.id, ctx, manager)
        }
      }

      // 6. Update Attributes
      if (attributes) {
        await this.attributeRepository.deleteByProductId(product.id, storeId, manager)
        if (attributes.length > 0) {
          await this.attributeRepository.saveMultiple(attributes, product.id, ctx, manager)
        }
      }

      // 7. Update Variants & Handle POs
      const poItems = []

      if (variants) {
        const existingVariants = await this.variantRepository.findByProductId(product.id, storeId)
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
          // Auto-generate on update if explicitly cleared
          if (variantDto.hasOwnProperty('sku') && !variantDto.sku) {
            variantDto.sku = generateVariantSku(product.slug, variantDto.combination)
          }
          if (variantDto.hasOwnProperty('barcode') && !variantDto.barcode) {
            variantDto.barcode = generateEAN13()
          }

          if (variantDto.sku) {
            const duplicate = await this.variantRepository.findBySku(
              variantDto.sku,
              storeId,
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
              { productId: product.id, storeId, id: Not(variantDto.id) },
              { isDefault: false },
            )
          }
        }

        // 7d. Handle New Variants
        for (const variantDto of newVariants) {
          // Auto-generate SKU & Barcode if missing
          if (!variantDto.sku) {
            variantDto.sku = generateVariantSku(product.slug, variantDto.combination)
          }
          if (!variantDto.barcode) {
            variantDto.barcode = generateEAN13()
          }

          // Check for conflicts (including soft-deleted)
          const duplicate = await this.variantRepository.findBySku(
            variantDto.sku,
            storeId,
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
              { productId: product.id, storeId, id: Not(savedVariant.id) },
              { isDefault: false },
            )
          }
        }
      }

      await this.cache.delCache(`product:${id}`, storeId)
    })

    await this.cache.delCacheByPattern('products:list:*', storeId)
    await this.cache.delCacheByPattern('products:latest:*', storeId)
    await this.cache.delCacheByPattern('products:filter-options:*', storeId)

    const updated = await this.findOneProduct(id, ctx)
    void this.productEmbeddingService.scheduleProductEmbeddingSync(storeId, updated.id)
    return updated
  }

  async removeProduct(
    id: string,
    ctx: RequestContextDto,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`${this.removeProduct.name} Service Called`)
    const storeId = ctx.storeId
    const product = await this.findOneProduct(id, ctx)
    await this.productEmbeddingService.removeEmbeddingsForProducts(storeId, [id])
    await this.productRepository.removeProduct(product as any as ProductEntity)

    await this.cache.delCache(`product:${id}`, storeId)
    await this.cache.delCacheByPattern('products:list:*', storeId)
    await this.cache.delCacheByPattern('products:latest:*', storeId)
    await this.cache.delCacheByPattern('products:filter-options:*', storeId)

    return { success: true, message: 'Product deleted successfully' }
  }

  async decrementStock(
    productId: string,
    quantity: number,
    ctx: RequestContextDto,
    variantId?: string,
  ): Promise<any> {
    this.logger.log(`${this.decrementStock.name} Service Called`)
    const storeId = ctx.storeId
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

  async findAllProductsCrossStore(): Promise<ProductEntity[]> {
    this.logger.log(`${this.findAllProductsCrossStore.name} Service Called`)
    return await this.crossStoreRepository.findAllProductsCrossStore()
  }

  async countByStore(ctx: RequestContextDto): Promise<number> {
    this.logger.log(`${this.countByStore.name} Service Called`)
    const storeId = ctx.storeId
    return await this.productRepository.countProducts(storeId)
  }

  async productOverview(): Promise<any> {
    this.logger.log(`${this.productOverview.name} Service Called`)
    return await this.productRepository.getOverviewStats()
  }

  async importProductsFromRows(
    dto: ImportProductsDto,
    ctx: RequestContextDto,
  ): Promise<ImportProductsResultDto> {
    const storeId = ctx.storeId
    const importBatchId = randomUUID()
    const createdProductIds: string[] = []
    const pendingDescriptionProductIds: string[] = []
    const errors: ImportProductsResultDto['errors'] = []
    let skippedCount = 0

    const categoryCache = new Map<string, string | null>()
    const usedSlugs = new Set<string>()

    for (let index = 0; index < dto.rows.length; index += 1) {
      const row = dto.rows[index]
      const rowNumber = index + 1

      try {
        const baseSlug = slugifyProductName(row.slug?.trim() || row.name)
        if (!baseSlug) {
          throw new ConflictException('Product name must contain alphanumeric characters')
        }

        let slug = baseSlug
        let suffix = 2
        while (usedSlugs.has(slug) || (await this.productRepository.findBySlug(slug, storeId))) {
          slug = `${baseSlug}-${suffix}`
          suffix += 1
        }
        usedSlugs.add(slug)

        let categoryId: string | undefined
        if (row.category?.trim()) {
          const categoryKey = row.category.trim().toLowerCase()
          if (!categoryCache.has(categoryKey)) {
            categoryCache.set(categoryKey, await this.resolveImportCategoryId(row.category.trim(), storeId))
          }
          categoryId = categoryCache.get(categoryKey) ?? undefined
        }

        const description = row.description?.trim()
          ? row.description.trim()
          : IMPORT_DESCRIPTION_PLACEHOLDER

        const created = await this.createProduct(
          {
            name: row.name.trim(),
            slug,
            description,
            shortDescription: undefined,
            price: Number(row.price),
            images: [],
            stock: 0,
            status: normalizeImportStatus(row.status),
            categoryId,
            sku: row.sku?.trim() || undefined,
            productType: 'SIMPLE',
          },
          ctx,
          { skipAutomation: true },
        )

        createdProductIds.push(created.id)
        if (isMissingImportedDescription(description)) {
          pendingDescriptionProductIds.push(created.id)
        }
      } catch (error: unknown) {
        skippedCount += 1
        const message = error instanceof Error ? error.message : 'Import failed'
        errors.push({ row: rowNumber, name: row.name, message })
      }
    }

    let descriptionJobId: string | null = null
    if (
      dto.generateDescriptions &&
      pendingDescriptionProductIds.length > 0 &&
      (await this.canQueueBulkDescriptionImport(storeId))
    ) {
      const job = await this.aiJobService.enqueueBulkDescriptionImport(storeId, {
        importBatchId,
        productIds: pendingDescriptionProductIds,
      })
      descriptionJobId = job.id
    }

    return {
      importBatchId,
      createdCount: createdProductIds.length,
      skippedCount,
      createdProductIds,
      pendingDescriptionProductIds,
      descriptionJobId,
      errors,
    }
  }

  private async canQueueBulkDescriptionImport(storeId: string): Promise<boolean> {
    const store = await this.storeService.findOneStores(storeId)
    const config = normalizeStoreAiConfig(store.aiConfig || null)
    return isStoreAiAutomationReady(config)
  }

  private async resolveImportCategoryId(
    categoryRef: string,
    storeId: string,
  ): Promise<string | null> {
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (uuidPattern.test(categoryRef)) {
      const category = await this.categoryRepository.findById(categoryRef, storeId)
      return category?.id ?? null
    }

    const slug = slugifyProductName(categoryRef)
    const bySlug = await this.categoryRepository.findBySlug(slug, storeId)
    if (bySlug) return bySlug.id

    const categories = await this.categoryRepository.findAllByStore(storeId)
    const match = categories.find(
      (category) => category.name.trim().toLowerCase() === categoryRef.trim().toLowerCase(),
    )
    return match?.id ?? null
  }
}
