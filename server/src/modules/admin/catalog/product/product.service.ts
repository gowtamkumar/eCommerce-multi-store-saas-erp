import { DiscountType } from '@/common/enums/discount-type.enum'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum'
import { DiscountStrategyFactory } from '@/common/strategies/discount/Discount-strategy.factory'
import { FaqRepository } from '@/modules/admin/content/faq/faq.repository'
import { PurchaseOrderService } from '@/modules/admin/operations/finance/purchase/purchase-order.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { InventoryTransactionService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.service'
import { PromotionService } from '@/modules/admin/sales/promotion/promotion.service'
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PromotionTargetType } from '../../sales/promotion/enums/promotion-target-type.enum'
import { BrandRepository } from '../brand/brand.repository'
import { ProductAttributeRepository } from './attribute.repository'
import { CreateProductDto } from './dto/create-product.dto'
import { FilterProductDto } from './dto/filter-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductEntity } from './entities/product.entity'
import { ProductRepository } from './product.repository'
import { ProductVariantRepository } from './variant.repository'

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
    private readonly inventoryService: InventoryTransactionService,
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly promotionService: PromotionService,
  ) { }

  private async attachPromotions(product: any, tenantId: string): Promise<AugmentedProduct> {
    this.logger.log(`${this.attachPromotions.name} Service Called`)
    if (!product) return product
    try {
      const activePromos = await this.promotionService.findActivePromotions(tenantId)
      if (!activePromos || activePromos.length === 0) return product

      const applicablePromotions = activePromos.filter((promo) => {
        if (promo.targetType === PromotionTargetType.SPECIFIC_PRODUCT && promo.targetId === product.id)
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

      let maxPromoDiscount = 0
      const basePrice = Number(product.price || 0)

      applicablePromotions.forEach((promo) => {
        const promoDiscountStrategy = DiscountStrategyFactory.create(promo.promotionType as string)
        const calcDiscount = promoDiscountStrategy.calculate(basePrice, Number(promo.value))
        if (calcDiscount > maxPromoDiscount) {
          maxPromoDiscount = calcDiscount
        }
      })

      const originalDiscountType = product.discountType || DiscountType.FIXED
      const originalRawDiscount = Number(product.discountAmount || 0)
      const originalDiscountStrategy = DiscountStrategyFactory.create(
        originalDiscountType as string,
      )
      const originalDiscountValue = originalDiscountStrategy.calculate(
        basePrice,
        originalRawDiscount,
      )

      let finalDiscountAmount = originalRawDiscount
      let finalDiscountType = originalDiscountType

      if (maxPromoDiscount > originalDiscountValue) {
        finalDiscountAmount = maxPromoDiscount
        finalDiscountType = DiscountType.FIXED
      }

      return {
        ...(product instanceof ProductEntity ? (product as ProductEntity) : product),
        applicablePromotions,
        discountAmount: finalDiscountAmount,
        discountType: finalDiscountType,
      } as AugmentedProduct
    } catch (error) {
      console.error('Error attaching promotions', error)
      return product
    }
  }

  private async attachPromotionsMany(
    products: any[],
    tenantId: string,
  ): Promise<AugmentedProduct[]> {
    this.logger.log(`${this.attachPromotionsMany.name} Service Called`)
    if (!products || products.length === 0) return products

    try {
      const activePromos = await this.promotionService.findActivePromotions(tenantId)
      if (!activePromos || activePromos.length === 0) return products

      // Cache strategies to avoid repeated instantiation
      const strategies: Record<string, any> = {}

      return products.map((product) => {
        const applicablePromotions = activePromos.filter((promo) => {
          const type = promo.targetType
          const id = promo.targetId

          if (type === PromotionTargetType.ENTIRE_ORDER) return true
          if (type === PromotionTargetType.SPECIFIC_PRODUCT && id === product.id) return true
          if (type === PromotionTargetType.SPECIFIC_CATEGORY && (id === product.categoryId || id === product.category?.id)) return true
          if (type === PromotionTargetType.SPECIFIC_BRAND && id === product.brandId) return true
          
          return false
        })

        const basePrice = Number(product.price || 0)
        let maxPromoDiscount = 0

        applicablePromotions.forEach((promo) => {
          const pType = promo.promotionType as string
          if (!strategies[pType]) {
            strategies[pType] = DiscountStrategyFactory.create(pType)
          }
          const calcDiscount = strategies[pType].calculate(basePrice, Number(promo.value))
          if (calcDiscount > maxPromoDiscount) {
            maxPromoDiscount = calcDiscount
          }
        })

        const originalDiscountType = product.discountType || DiscountType.FIXED
        const originalRawDiscount = Number(product.discountAmount || 0)
        
        if (!strategies[originalDiscountType]) {
          strategies[originalDiscountType] = DiscountStrategyFactory.create(originalDiscountType)
        }
        
        const originalDiscountValue = strategies[originalDiscountType].calculate(
          basePrice,
          originalRawDiscount,
        )

        let finalDiscountAmount = originalRawDiscount
        let finalDiscountType = originalDiscountType

        if (maxPromoDiscount > originalDiscountValue) {
          finalDiscountAmount = maxPromoDiscount
          finalDiscountType = DiscountType.FIXED
        }

        return {
          ...(product instanceof ProductEntity ? (product as ProductEntity) : product),
          applicablePromotions,
          discountAmount: finalDiscountAmount,
          discountType: finalDiscountType,
        } as AugmentedProduct
      })
    } catch (error) {
      this.logger.error('Error attaching promotions many', error)
      return products
    }
  }

  async findAllProducts(
    filterDto: FilterProductDto,
    tenantId: string,
  ): Promise<{ products: AugmentedProduct[]; total: number }> {
    this.logger.log(`${this.findAllProducts.name} Service Called`)
    const [products, total] = await this.productRepository.findAllWithFilters(filterDto, tenantId)
    const productsWithPromotions = await this.attachPromotionsMany(products, tenantId)
    return { products: productsWithPromotions, total }
  }

  async getFilterOptions(tenantId: string, categoryId?: string): Promise<any> {
    this.logger.log(`${this.getFilterOptions.name} Service Called`)
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
      tenantId
    )
  }

  async findBySlugProduct(slug: string, tenantId: string): Promise<ProductEntity> {
    this.logger.log(`${this.findBySlugProduct.name} Service Called`)
    const product = await this.productRepository.findBySlugWithRelations(slug, tenantId)

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    return await this.attachPromotions(product, tenantId)
  }

  async createProduct(createProductDto: CreateProductDto, tenantId: string): Promise<ProductEntity> {
    this.logger.log(`${this.createProduct.name} Service Called`)
    const existing = await this.productRepository.findBySlug(createProductDto.slug, tenantId)

    if (existing) {
      throw new ConflictException('Product with this slug already exists')
    }

    const { faqs, attributes, variants, ...productData } = createProductDto

    const savedProduct = await this.productRepository.createAndSave(productData, tenantId)

    const poItems = []

    if (productData.stock > 0 && (!variants || variants.length === 0)) {
      poItems.push({
        productId: savedProduct.id,
        quantity: productData.stock,
        unitPrice: productData.price,
      })
    }

    if (faqs && faqs.length > 0) {
      await this.faqRepository.saveMultiple(faqs, savedProduct.id, tenantId)
    }

    if (attributes && attributes.length > 0) {
      await this.attributeRepository.saveMultiple(attributes, savedProduct.id, tenantId)
    }

    if (variants && variants.length > 0) {
      for (const variantDto of variants) {
        const savedVariant = await this.variantRepository.saveNewVariant(
          variantDto,
          savedProduct.id,
          tenantId,
        )

        if (variantDto.stock > 0) {
          poItems.push({
            productId: savedProduct.id,
            variantId: savedVariant.id,
            quantity: variantDto.stock,
            unitPrice: variantDto.price || productData.price,
          })
        }
      }
    }

    if (poItems.length > 0 && createProductDto.supplierId) {
      const po = await this.purchaseOrderService.createPurchaseOrder(
        {
          supplierId: createProductDto.supplierId,
          referenceNumber: `INITIAL_${savedProduct.slug.toUpperCase()}_${Date.now()}`,
          items: poItems,
        },
        tenantId,
      )

      await this.purchaseOrderService.updatePurchaseOrderStatus(
        po.id,
        { status: PurchaseOrderStatus.RECEIVED },
        tenantId,
      )
    }

    const newProduct = await this.findOneProduct(savedProduct.id, tenantId)
    return newProduct
  }

  async findLatestProducts(tenantId: string, limit: number = 10): Promise<AugmentedProduct[]> {
    this.logger.log(`${this.findLatestProducts.name} Service Called`)
    const cacheKey = `products:latest:${limit}`
    
    return this.cache.rememberCache(
      cacheKey,
      async () => {
        const products = await this.productRepository.findLatestProducts(tenantId, limit)
        return await this.attachPromotionsMany(products, tenantId)
      },
      300, // 5 minutes
      tenantId
    )
  }

  async findOneProduct(id: string, tenantId: string): Promise<AugmentedProduct> {
    this.logger.log(`${this.findOneProduct.name} Service Called`)
    const cacheKey = `product:${id}`

    const cached = await this.cache.getCache(cacheKey, tenantId)

    if (cached) {
      console.log('Get from cache', cached ? 'HIT' : 'MISS')
      return cached as AugmentedProduct
    }

    console.log('Get from db')

    const product = await this.productRepository.findByIdWithRelations(id, tenantId)

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    await this.cache.setCache(cacheKey, product, 300, tenantId)

    return await this.attachPromotions(product, tenantId)
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    tenantId: string,
  ): Promise<AugmentedProduct> {
    this.logger.log(`${this.updateProduct.name} Service Called`)
    const product = await this.findOneProduct(id, tenantId)

    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existing = await this.productRepository.findBySlug(updateProductDto.slug, tenantId)

      if (existing) {
        throw new ConflictException('Product with this slug already exists')
      }
    }

    const { faqs, attributes, variants, ...productData } = updateProductDto

    await this.productRepository.updateAndSave(product as any as ProductEntity, productData)

    if (faqs) {
      await this.faqRepository.deleteByProductId(product.id, tenantId)
      if (faqs.length > 0) {
        await this.faqRepository.saveMultiple(faqs, product.id, tenantId)
      }
    }

    if (attributes) {
      await this.attributeRepository.deleteByProductId(product.id, tenantId)
      if (attributes.length > 0) {
        await this.attributeRepository.saveMultiple(attributes, product.id, tenantId)
      }
    }

    if (variants) {
      const existingVariants = await this.variantRepository.findByProductId(product.id, tenantId)
      const existingVariantIds = existingVariants.map((v) => v.id)

      const incomingVariantsWithId = variants.filter((v: any) => v.id)
      const incomingVariantIds = incomingVariantsWithId.map((v: any) => v.id)
      const newVariants = variants.filter((v: any) => !v.id)

      for (const variantDto of incomingVariantsWithId) {
        await this.variantRepository.saveExistingVariant(variantDto, product.id, tenantId)
      }

      const poItems = []

      for (const variantDto of newVariants) {
        const savedVariant = await this.variantRepository.saveNewVariant(
          variantDto,
          product.id,
          tenantId,
        )

        if (variantDto.stock > 0) {
          poItems.push({
            productId: product.id,
            variantId: savedVariant.id,
            quantity: variantDto.stock,
            unitPrice: variantDto.price || product.price,
          })
        }
      }

      if (poItems.length > 0 && product.supplierId) {
        const po = await this.purchaseOrderService.createPurchaseOrder(
          {
            supplierId: product.supplierId,
            referenceNumber: `INITIAL_VAR_${product.slug.toUpperCase()}_${Date.now()}`,
            items: poItems,
          },
          tenantId,
        )

        await this.purchaseOrderService.updatePurchaseOrderStatus(
          po.id,
          { status: PurchaseOrderStatus.RECEIVED },
          tenantId,
        )
      }

      const toDeleteIds = existingVariantIds.filter((dbId) => !incomingVariantIds.includes(dbId))

      if (toDeleteIds.length > 0) {
        try {
          await this.variantRepository.deleteByIds(toDeleteIds)
        } catch (error) {
          console.warn(`Failed to delete variants ${toDeleteIds.join(', ')}: ${error.message}`)
        }
      }
    }

    await this.cache.delCache(`product:${id}`, tenantId)

    return await this.findOneProduct(id, tenantId)
  }

  async removeProduct(
    id: string,
    tenantId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`${this.removeProduct.name} Service Called`)
    const product = await this.findOneProduct(id, tenantId)
    await this.productRepository.removeProduct(product as any as ProductEntity)

    await this.cache.delCache(`product:${id}`, tenantId)

    return { success: true, message: 'Product deleted successfully' }
  }

  async decrementStock(
    productId: string,
    quantity: number,
    tenantId: string,
    variantId?: string,
  ): Promise<any> {
    this.logger.log(`${this.decrementStock.name} Service Called`)
    return await this.inventoryService.createInventoryTransaction(
      {
        productId,
        variantId,
        quantity,
        type: InventoryTransactionType.OUT,
        referenceType: InventoryTransactionReferenceType.ADJUSTMENT,
      },
      tenantId,
    )
  }

  async findAllProductsCrossTenant(): Promise<ProductEntity[]> {
    this.logger.log(`${this.findAllProductsCrossTenant.name} Service Called`)
    return await this.productRepository.findAllCrossTenant()
  }

  async countByTenant(tenantId: string): Promise<number> {
    this.logger.log(`${this.countByTenant.name} Service Called`)
    return await this.productRepository.countProducts(tenantId)
  }

  async productOverview(): Promise<any> {
    this.logger.log(`${this.productOverview.name} Service Called`)
    return await this.productRepository.getOverviewStats()
  }
}
