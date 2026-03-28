import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ProductStatus } from '@/common/enums/product-status.enum'
import { PurchaseOrderStatus } from '@/common/enums/purchase-order-status.enum'
import { Repository } from 'typeorm'
import { InventoryTransactionReferenceType } from '@/common/enums/inventory-transaction-reference-type.enum'
import { InventoryTransactionType } from '@/common/enums/inventory-transaction-type.enum'
import { FaqRepository } from '@/modules/admin/content/faq/faq.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { InventoryTransactionService } from '@/modules/admin/operations/logistics/inventory-transaction/inventory-transaction.service'
import { PurchaseOrderService } from '@/modules/admin/operations/finance/purchase/purchase-order.service'
import { PromotionService } from '@/modules/admin/sales/promotion/promotion.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductAttributeEntity } from './entities/attribute.entity'
import { ProductEntity } from './entities/product.entity'
import { ProductVariantEntity } from './entities/variant.entity'
import { ProductRepository } from './product.repository'
import { ProductAttributeRepository } from './attribute.repository'
import { ProductVariantRepository } from './variant.repository'
import { BrandEntity } from '../brand/entities/brand.entity'
import { PromotionType } from '../../sales/promotion/enums/promotion-type.enum'
import { DiscountType } from '@/common/enums/discount-type.enum'
import { DiscountStrategyFactory } from '@/common/strategies/discount/Discount-strategy.factory'
import { PromotionTargetType } from '../../sales/promotion/enums/promotion-target-type.enum'

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name)

  constructor(
    private productRepository: ProductRepository,
    private faqRepository: FaqRepository,
    private attributeRepository: ProductAttributeRepository,
    private variantRepository: ProductVariantRepository,
    @InjectRepository(BrandEntity)
    private brandRepository: Repository<BrandEntity>,
    private cache: CacheService,
    private readonly inventoryService: InventoryTransactionService,
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly promotionService: PromotionService,
  ) {}

  private async attachPromotions(product: any, tenantId: string) {
    this.logger.log(`${this.attachPromotions.name} Service Called`)
    if (!product) return product
    try {
      const activePromos = await this.promotionService.findActivePromotions(tenantId)
      if (!activePromos || activePromos.length === 0) return product

      const applicablePromotions = activePromos.filter((promo) => {
        if (promo.targetType === 'specific_product' && promo.targetId === product.id) return true
        if (
          promo.targetType === 'specific_category' &&
          (promo.targetId === product.categoryId ||
            (product.category && promo.targetId === product.category.id))
        )
          return true
        if (promo.targetType === 'specific_brand' && promo.targetId === product.brandId) return true
        return false
      })

      // Calculate maximum possible discount from promotions to display on the product
      let maxPromoDiscount = 0
      const basePrice = Number(product.price || 0)

      applicablePromotions.forEach((promo) => {
        const promoDiscountStrategy = DiscountStrategyFactory.create(promo.promotionType as string)
        const calcDiscount = promoDiscountStrategy.calculate(basePrice, Number(promo.value))
        if (calcDiscount > maxPromoDiscount) {
          maxPromoDiscount = calcDiscount
        }
      })

      // Calculate the original discount value in flat currency
      const originalDiscountType = product.discountType || DiscountType.FIXED
      const originalRawDiscount = Number(product.discountAmount || 0)
      const originalDiscountStrategy = DiscountStrategyFactory.create(
        originalDiscountType as string,
      )
      const originalDiscountValue = originalDiscountStrategy.calculate(
        basePrice,
        originalRawDiscount,
      )

      // Determine final discount: keep original type/amount if higher, else use flat promo amount
      let finalDiscountAmount = originalRawDiscount
      let finalDiscountType = originalDiscountType

      if (maxPromoDiscount > originalDiscountValue) {
        finalDiscountAmount = maxPromoDiscount
        finalDiscountType = DiscountType.FIXED
      }

      return {
        ...product,
        applicablePromotions,
        discountAmount: finalDiscountAmount,
        discountType: finalDiscountType,
      }
    } catch (error) {
      console.error('Error attaching promotions', error)
      return product
    }
  }

  private async attachPromotionsMany(products: any[], tenantId: string) {
    this.logger.log(`${this.attachPromotionsMany.name} Service Called`)
    if (!products || products.length === 0) return products
    try {
      const activePromos = await this.promotionService.findActivePromotions(tenantId)
      if (!activePromos || activePromos.length === 0) return products

      return products.map((product) => {
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
          return false
        })

        // Calculate maximum possible discount from promotions to display on the product
        let maxPromoDiscount = 0
        const basePrice = Number(product.price || 0)

        applicablePromotions.forEach((promo) => {
          const promoDiscountStrategy = DiscountStrategyFactory.create(
            promo.promotionType as string,
          )
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
          ...product,
          applicablePromotions,
          discountAmount: finalDiscountAmount,
          discountType: finalDiscountType,
        }
      })
    } catch (error) {
      console.error('Error attaching promotions many', error)
      return products
    }
  }

  async findAllProducts(filterDto: any, tenantId: string) {
    this.logger.log(`${this.findAllProducts.name} Service Called`)
    const page = Math.max(1, parseInt(filterDto.page) || 1)
    const limit = Math.max(1, parseInt(filterDto.limit) || 10)
    const { q, status, categoryId, brandId } = filterDto

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .leftJoin('product.variants', 'variants')
      .where('product.tenantId = :tenantId', { tenantId })
      .select(['product', 'category', 'variants'])
    if (status) {
      query.andWhere('product.status = :status', { status })
    }

    if (filterDto.categoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId: filterDto.categoryId })
    }

    if (filterDto.brandId) {
      query.andWhere('product.brandId = :brandId', { brandId: filterDto.brandId })
    }

    if (filterDto.minPrice !== undefined && filterDto.minPrice !== null) {
      query.andWhere('product.price >= :minPrice', { minPrice: Number(filterDto.minPrice) })
    }

    if (filterDto.maxPrice !== undefined && filterDto.maxPrice !== null) {
      query.andWhere('product.price <= :maxPrice', { maxPrice: Number(filterDto.maxPrice) })
    }

    if (q) {
      query.andWhere('(product.name ILIKE :q OR product.description ILIKE :q)', { q: `%${q}%` })
    }

    if (filterDto.attributes) {
      try {
        const attrFilters = JSON.parse(filterDto.attributes)
        const filteredEntries = Object.entries(attrFilters).filter(
          ([_, v]) => Array.isArray(v) && v.length > 0,
        )

        if (filteredEntries.length > 0) {
          let existsQuery = `SELECT 1 FROM product_variants v WHERE v.product_id = product.id`
          const params = {}

          filteredEntries.forEach(([key, values], index) => {
            existsQuery += ` AND v.combination->>:key${index} IN (:...values${index})`
            params[`key${index}`] = key
            params[`values${index}`] = values
          })

          query.andWhere(`EXISTS (${existsQuery})`, params)
        }
      } catch (e) {
        this.logger.error('Failed to parse attributes filter', e)
      }
    }

    const [products, total] = await query
      .orderBy(this.getSortOptions(filterDto.sort))
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    const productsWithPromotions = await this.attachPromotionsMany(products, tenantId)

    return { products: productsWithPromotions, total }
  }

  async getFilterOptions(tenantId: string, categoryId?: string) {
    this.logger.log(`${this.getFilterOptions.name} Service Called`)

    // 1. Fetch Min/Max Price
    const priceQuery = this.productRepository
      .createQueryBuilder('product')
      .where('product.tenantId = :tenantId', { tenantId })
      .select('MIN(product.price)', 'min')
      .addSelect('MAX(product.price)', 'max')

    if (categoryId) {
      priceQuery.andWhere('product.categoryId = :categoryId', { categoryId })
    }
    const prices = await priceQuery.getRawOne()

    // 2. Fetch Unique Brands that have products in this context
    const brandQuery = this.brandRepository
      .createQueryBuilder('brand')
      .innerJoin(ProductEntity, 'product', 'product.brandId = brand.id')
      .where('brand.tenantId = :tenantId', { tenantId })
      .select('brand.id', 'id')
      .addSelect('brand.name', 'name')
      .addSelect('brand.slug', 'slug')
      .distinct(true)

    if (categoryId) {
      brandQuery.andWhere('product.categoryId = :categoryId', { categoryId })
    }
    const brands = await brandQuery.getRawMany()

    // 3. Fetch Unique Attributes from Variants (JSONB)
    const variantQuery = this.variantRepository
      .createQueryBuilder('variant')
      .innerJoin('variant.product', 'product')
      .where('variant.tenantId = :tenantId', { tenantId })
      .select('variant.combination', 'combination')

    if (categoryId) {
      variantQuery.andWhere('product.categoryId = :categoryId', { categoryId })
    }
    const variants = await variantQuery.getRawMany()

    const attributeMap: Record<string, Set<string>> = {}
    variants.forEach((v) => {
      if (v.combination) {
        Object.entries(v.combination).forEach(([key, value]) => {
          if (!attributeMap[key]) attributeMap[key] = new Set()
          attributeMap[key].add(value as string)
        })
      }
    })

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
  }

  async findBySlugProduct(slug: string, tenantId: string) {
    this.logger.log(`${this.findBySlugProduct.name} Service Called`)
    const product = await this.productRepository.findOne({
      where: { slug, tenantId },
      relations: ['faqs', 'category', 'attributes', 'variants', 'reviews'],
    })

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    return await this.attachPromotions(product, tenantId)
  }

  async createProduct(createProductDto: CreateProductDto, tenantId: string) {
    this.logger.log(`${this.createProduct.name} Service Called`)
    // Check if slug exists for this tenant
    const existing = await this.productRepository.findOne({
      where: { slug: createProductDto.slug, tenantId },
    })

    if (existing) {
      throw new ConflictException('Product with this slug already exists')
    }

    const { faqs, attributes, variants, ...productData } = createProductDto

    const product = this.productRepository.create({
      ...productData,
      tenantId,
      stock: 0, // Ensure base stock is 0, handled via transactions
    })

    const savedProduct = await this.productRepository.save(product)

    // Handle initial stock via Purchase Order if stock > 0
    const poItems = []

    // Check base product stock (if no variants)
    if (productData.stock > 0 && (!variants || variants.length === 0)) {
      poItems.push({
        productId: savedProduct.id,
        quantity: productData.stock,
        unitPrice: productData.price, // Use product price as default unit price
      })
    }

    // Save FAQs
    if (faqs && faqs.length > 0) {
      const faqEntities = faqs.map((faq) =>
        this.faqRepository.create({
          ...faq,
          productId: savedProduct.id,
          tenantId,
        }),
      )
      await this.faqRepository.save(faqEntities)
    }

    // Save Attributes
    if (attributes && attributes.length > 0) {
      const attributeEntities = attributes.map((attr) =>
        this.attributeRepository.create({
          ...attr,
          productId: savedProduct.id,
          tenantId,
        }),
      )
      await this.attributeRepository.save(attributeEntities)
    }

    // Save Variants
    if (variants && variants.length > 0) {
      for (const variantDto of variants) {
        const variant = this.variantRepository.create({
          ...variantDto,
          productId: savedProduct.id,
          tenantId,
          stock: 0,
        })
        const savedVariant = await this.variantRepository.save(variant)

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

    // Create a RECEIVED Purchase Order if there are items to stock
    if (poItems.length > 0 && createProductDto.supplierId) {
      const po = await this.purchaseOrderService.createPurchaseOrder(
        {
          supplierId: createProductDto.supplierId,
          referenceNumber: `INITIAL_${savedProduct.slug.toUpperCase()}_${Date.now()}`,
          items: poItems,
        },
        tenantId,
      )

      // Mark as received immediately to trigger inventory
      await this.purchaseOrderService.updatePurchaseOrderStatus(
        po.id,
        { status: PurchaseOrderStatus.RECEIVED },
        tenantId,
      )
    }

    const newProduct = await this.findOneProduct(savedProduct.id, tenantId)
    return newProduct // Promos are already attached in findOne
  }

  async findLatestProducts(tenantId: string, limit: number = 10) {
    this.logger.log(`${this.findLatestProducts.name} Service Called`)
    const products = await this.productRepository.find({
      where: { tenantId },
      relations: ['variants', 'category'],
      order: { createdAt: 'DESC' },
      take: limit,
    })

    return await this.attachPromotionsMany(products, tenantId)
  }

  async findOneProduct(id: string, tenantId: string) {
    this.logger.log(`${this.findOneProduct.name} Service Called`)
    const cacheKey = `product:${id}`

    const cached = await this.cache.getCache(cacheKey, tenantId)

    if (cached) {
      console.log('Get from cache', cached ? 'HIT' : 'MISS')
      return cached
    }

    console.log('Get from db')

    const product = await this.productRepository.findOne({
      where: { id, tenantId },
      relations: ['faqs', 'attributes', 'variants', 'category'],
    })

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    await this.cache.setCache(cacheKey, product, 300, tenantId)

    return await this.attachPromotions(product, tenantId)
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto, tenantId: string) {
    this.logger.log(`${this.updateProduct.name} Service Called`)
    const product: any = await this.findOneProduct(id, tenantId)

    // If slug is being updated, check uniqueness
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existing = await this.productRepository.findOne({
        where: { slug: updateProductDto.slug, tenantId },
      })

      if (existing) {
        throw new ConflictException('Product with this slug already exists')
      }
    }

    const { faqs, attributes, variants, ...productData } = updateProductDto

    // If categoryId is specifically provided (even as null),
    // we should nullify the category object to ensure TypeORM uses the categoryId column
    if ('categoryId' in productData) {
      product.category = null
    }

    Object.assign(product, productData)
    await this.productRepository.save(product)

    // Sync FAQs
    if (faqs) {
      await this.faqRepository.delete({ productId: product.id, tenantId })
      if (faqs.length > 0) {
        const faqEntities = faqs.map((faq) =>
          this.faqRepository.create({
            ...faq,
            productId: product.id,
            tenantId,
          }),
        )
        await this.faqRepository.save(faqEntities)
      }
    }

    // Sync Attributes
    if (attributes) {
      await this.attributeRepository.delete({ productId: product.id, tenantId })
      if (attributes.length > 0) {
        const attributeEntities = attributes.map((attr) =>
          this.attributeRepository.create({
            ...attr,
            productId: product.id,
            tenantId,
          }),
        )
        await this.attributeRepository.save(attributeEntities)
      }
    }

    // Sync Variants
    if (variants) {
      // 1. Fetch existing variants to know what to delete
      const existingVariants = await this.variantRepository.find({
        where: { productId: product.id, tenantId },
      })
      const existingVariantIds = existingVariants.map((v) => v.id)

      // 2. Identify incoming IDs (to exclude from deletion)
      const incomingVariantsWithId = variants.filter((v: any) => v.id)
      const incomingVariantIds = incomingVariantsWithId.map((v: any) => v.id)
      const newVariants = variants.filter((v: any) => !v.id)

      // 3. Update existing variants
      for (const variantDto of incomingVariantsWithId) {
        const variant = this.variantRepository.create({
          ...variantDto,
          productId: product.id,
          tenantId,
          // We don't touch stock here, as it's handled by transactions
          // Unless the user explicitly wants to adjust it via update?
          // If updateDto has stock, maybe we should log an ADJUSTMENT?
          // For now, let's keep it simple: only handle NEW variants as INITIAL.
        })
        await this.variantRepository.save(variant)
      }

      const poItems = []

      // 4. Create new variants and log stock via Purchase Order
      for (const variantDto of newVariants) {
        const variant = this.variantRepository.create({
          ...variantDto,
          productId: product.id,
          tenantId,
          stock: 0, // Ensure variant stock starts at 0, handled via transactions
        })
        const savedVariant = await this.variantRepository.save(variant)

        if (variantDto.stock > 0) {
          poItems.push({
            productId: product.id,
            variantId: savedVariant.id,
            quantity: variantDto.stock,
            unitPrice: variantDto.price || product.price,
          })
        }
      }

      // Create a RECEIVED Purchase Order for new variants if there are items to stock
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

      // 5. Delete removed variants
      const toDeleteIds = existingVariantIds.filter((id) => !incomingVariantIds.includes(id))

      if (toDeleteIds.length > 0) {
        try {
          await this.variantRepository.delete(toDeleteIds)
        } catch (error) {
          // If deletion fails (e.g. FK constraint), we log it but don't crash
          console.warn(`Failed to delete variants ${toDeleteIds.join(', ')}: ${error.message}`)
        }
      }
    }

    // Invalidate cache after update
    await this.cache.delCache(`product:${id}`, tenantId)

    return await this.findOneProduct(id, tenantId)
  }

  async removeProduct(id: string, tenantId: string) {
    this.logger.log(`${this.removeProduct.name} Service Called`)
    const product: any = await this.findOneProduct(id, tenantId)
    await this.productRepository.remove(product)

    // Invalidate cache after deletion
    await this.cache.delCache(`product:${id}`, tenantId)

    return { success: true, message: 'Product deleted successfully' }
  }

  async decrementStock(productId: string, quantity: number, tenantId: string, variantId?: string) {
    this.logger.log(`${this.decrementStock.name} Service Called`)
    // Note: The inventory service handles updating the static stock fields (cache)
    // and logging the transaction record.
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

  async findAllProductsCrossTenant() {
    this.logger.log(`${this.findAllProductsCrossTenant.name} Service Called`)
    return await this.productRepository.find()
  }

  async countByTenant(tenantId: string) {
    this.logger.log(`${this.countByTenant.name} Service Called`)
    return await this.productRepository.count({ where: { tenantId } })
  }

  private getSortOptions(sort?: string): any {
    this.logger.log(`${this.getSortOptions.name} Service Called`)
    switch (sort) {
      case 'price-low':
        return { 'product.price': 'ASC' }
      case 'price-high':
        return { 'product.price': 'DESC' }
      case 'name-asc':
        return { 'product.name': 'ASC' }
      case 'name-desc':
        return { 'product.name': 'DESC' }
      case 'newest':
      default:
        return { 'product.createdAt': 'DESC' }
    }
  }
  // this function for system plateform
  async productOverview() {
    this.logger.log(`${this.productOverview.name} Service Called`)
    const totalProducts = await this.productRepository.count()
    const activeProducts = await this.productRepository.count({
      where: { status: ProductStatus.ACTIVE },
    })
    const inactiveProducts = await this.productRepository.count({
      where: { status: ProductStatus.INACTIVE },
    })
    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
    }
  }
}
