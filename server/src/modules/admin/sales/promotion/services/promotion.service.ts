import { RequestContextDto } from '@/common/dto/request-context.dto'
import { ProductRepository } from '@/modules/admin/catalog/product/repositories/product.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreatePromotionDto } from '../dto/create-promotion.dto'
import { UpdatePromotionDto } from '../dto/update-promotion.dto'
import { PromotionEntity } from '../entities/promotion.entity'
import { PromotionTargetType } from '../enums/promotion-target-type.enum'
import { PromotionType } from '../enums/promotion-type.enum'
import { PromotionRepository } from '../repositories/promotion.repository'

@Injectable()
export class PromotionService {
  private readonly logger = new Logger(PromotionService.name)

  constructor(
    private promotionRepository: PromotionRepository,
    private productRepository: ProductRepository,
    private cache: CacheService,
  ) {}

  async createPromotion(
    createPromotionDto: CreatePromotionDto,
    ctx: RequestContextDto,
  ): Promise<PromotionEntity> {
    this.logger.log(`${this.createPromotion.name} Service Called`)
    const storeId = ctx.storeId
    const slug = createPromotionDto.slug || this.generateSlug(createPromotionDto.name)

    // Check if slug exists
    const existing = await this.promotionRepository.findBySlug(slug, storeId)
    if (existing) {
      // If auto-generated, append timestamp to make unique
      if (!createPromotionDto.slug) {
        return this.createPromotion(
          { ...createPromotionDto, slug: `${slug}-${Date.now().toString().slice(-4)}` },
          ctx,
        )
      }
      throw new ConflictException('Promotion with this slug already exists')
    }

    const saved = await this.promotionRepository.createAndSave(createPromotionDto, ctx)
    // Invalidate all affected cache keys
    await Promise.all([
      this.cache.delCache('promotions:active', storeId),
      this.cache.delCacheByPattern('promotions:list*', storeId),
      this.cache.delCache('promotions:offers', storeId),
    ])
    return saved
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
  }

  async findAllPromotions(
    filterDto: any,
    ctx: RequestContextDto,
  ): Promise<{ promotions: PromotionEntity[]; total: number }> {
    this.logger.log(`${this.findAllPromotions.name} Service Called`)
    const storeId = ctx.storeId
    const { page = 1, limit = 10, search = '', isActive } = filterDto
    const cacheKey = `promotions:list:p${page}:l${limit}:q${search}:a${isActive ?? 'all'}`

    return this.cache.rememberCache(
      cacheKey,
      async () => {
        const [promotions, total] = await this.promotionRepository.findAllWithFilters(
          filterDto,
          storeId,
        )
        return { promotions, total }
      },
      300, // 5 min TTL
      storeId,
    )
  }

  async findActivePromotions(ctx: RequestContextDto): Promise<PromotionEntity[]> {
    this.logger.log(`${this.findActivePromotions.name} Service Called`)
    const storeId = ctx.storeId
    const cacheKey = `promotions:active`

    return this.cache.rememberCache(
      cacheKey,
      () => this.promotionRepository.findActivePromotions(storeId, new Date()),
      600, // 10 minutes
      storeId,
    )
  }

  async findOne(id: string, ctx: RequestContextDto): Promise<PromotionEntity> {
    this.logger.log(`${this.findOne.name} Service Called`)
    const storeId = ctx.storeId
    const promotion = await this.cache.rememberCache(
      `promotions:id:${id}`,
      () => this.promotionRepository.findById(id, storeId),
      600,
      storeId,
    )
    if (!promotion) throw new NotFoundException('Promotion not found')
    return promotion
  }

  async findOneBySlug(slug: string, ctx: RequestContextDto): Promise<PromotionEntity> {
    this.logger.log(`${this.findOneBySlug.name} Service Called`)
    const storeId = ctx.storeId
    const promotion = await this.cache.rememberCache(
      `promotions:slug:${slug}`,
      () => this.promotionRepository.findBySlug(slug, storeId),
      600,
      storeId,
    )
    if (!promotion) throw new NotFoundException('Promotion not found')
    return promotion
  }

  async updatePromotion(
    id: string,
    updatePromotionDto: UpdatePromotionDto,
    ctx: RequestContextDto,
  ): Promise<PromotionEntity> {
    this.logger.log(`${this.updatePromotion.name} Service Called`)
    const storeId = ctx.storeId
    const promotion = await this.findOne(id, ctx)

    // Slug renames need the same conflict check as `createPromotion`,
    // otherwise the composite store-scoped unique index throws a raw
    // 23505 instead of a friendly 409.
    if (updatePromotionDto.slug && updatePromotionDto.slug !== promotion.slug) {
      const slugTaken = await this.promotionRepository.findBySlug(updatePromotionDto.slug, storeId)
      if (slugTaken && slugTaken.id !== id) {
        throw new ConflictException('Promotion with this slug already exists')
      }
    }

    const updated = await this.promotionRepository.updateAndSave(promotion, updatePromotionDto)
    // Invalidate all affected cache keys atomically
    await Promise.all([
      this.cache.delCache('promotions:active', storeId),
      this.cache.delCacheByPattern('promotions:list*', storeId),
      this.cache.delCache('promotions:offers', storeId),
      this.cache.delCache(`promotions:id:${id}`, storeId),
      this.cache.delCache(`promotions:slug:${promotion.slug}`, storeId),
    ])
    return updated
  }

  async removePromotion(
    id: string,
    ctx: RequestContextDto,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`${this.removePromotion.name} Service Called`)
    const storeId = ctx.storeId
    const promotion = await this.findOne(id, ctx)
    await this.promotionRepository.removePromotion(promotion)
    await Promise.all([
      this.cache.delCache('promotions:active', storeId),
      this.cache.delCacheByPattern('promotions:list*', storeId),
      this.cache.delCache('promotions:offers', storeId),
      this.cache.delCache(`promotions:id:${id}`, storeId),
      this.cache.delCache(`promotions:slug:${promotion.slug}`, storeId),
    ])
    return { success: true, message: 'Promotion deleted successfully' }
  }

  /**
   * Shared helper: enriches a raw product with computed promotion discount fields.
   * Extracted to eliminate duplication between getOfferProducts and getOfferProductsBySlug.
   */
  private enrichProductWithPromo(p: any, promotion: PromotionEntity): any {
    const basePrice = Number(p.price)
    let promoDiscount = 0

    if (promotion.promotionType === PromotionType.PERCENTAGE && promotion.value) {
      promoDiscount = Math.round((basePrice * Number(promotion.value)) / 100)
    } else if (promotion.promotionType === PromotionType.FIXED && promotion.value) {
      promoDiscount = Number(promotion.value)
    }

    const finalPrice = Math.max(0, basePrice - promoDiscount)

    return {
      ...p,
      promoDiscount,
      promoDiscountPercentage:
        promotion.promotionType === PromotionType.PERCENTAGE
          ? Number(promotion.value)
          : basePrice > 0
            ? Math.round((promoDiscount / basePrice) * 100)
            : 0,
      finalPrice,
      promotionId: promotion.id,
      promotionName: promotion.name,
      promotionType: promotion.promotionType,
    }
  }

  /**
   * Public endpoint: returns all active promotions with their applicable products.
   * Used by the customer storefront /offers page.
   * Heavily cached — this is the highest-traffic public endpoint.
   */
  async getOfferProducts(
    ctx: RequestContextDto,
  ): Promise<{ promotions: PromotionEntity[]; offerGroups: any[] }> {
    this.logger.log(`${this.getOfferProducts.name} Service Called`)
    const storeId = ctx.storeId
    return this.cache.rememberCache(
      'promotions:offers',
      async () => {
        const now = new Date()
        const promotions = await this.promotionRepository.findActivePromotions(storeId, now)
        this.logger.log(`Found ${promotions.length} active promotions for store: ${storeId}`)

        if (!promotions.length) {
          return { promotions: [], offerGroups: [] }
        }

        // Fetch products for ALL promotions in PARALLEL
        const productResults = await Promise.all(
          promotions.map((promo) =>
            this.productRepository.findOfferProducts({
              storeId,
              targetType: promo.targetType,
              targetId: promo.targetId,
              limit:
                promo.targetType === PromotionTargetType.ENTIRE_ORDER ||
                promo.targetType === PromotionTargetType.MINIMUM_CART_VALUE
                  ? 12
                  : 20,
            }),
          ),
        )

        // Build enriched offer groups — filter out empty groups
        const offerGroups = promotions
          .map((promotion, i) => {
            const products = productResults[i].map((p) => this.enrichProductWithPromo(p, promotion))
            this.logger.log(`Promotion "${promotion.name}" has ${products.length} products.`)
            return {
              promotion,
              products,
            }
          })
          .filter((g) => g.products.length > 0)

        this.logger.log(`Returning ${offerGroups.length} offer groups after filtering empty ones.`)
        return { promotions, offerGroups }
      },
      900, // 15 minutes — invalidated on write; read-heavy endpoint
      storeId,
    )
  }

  async getOfferProductsBySlug(
    slug: string,
    ctx: RequestContextDto,
  ): Promise<{ promotion: PromotionEntity; products: any[] }> {
    this.logger.log(`${this.getOfferProductsBySlug.name} Service Called`)
    const storeId = ctx.storeId
    const promotion = await this.findOneBySlug(slug, ctx)

    const now = new Date()
    const isActive =
      promotion.isActive &&
      (!promotion.startDate || new Date(promotion.startDate) <= now) &&
      (!promotion.endDate || new Date(promotion.endDate) >= now)

    if (!isActive) {
      return { promotion, products: [] }
    }

    const products = await this.getProductsForPromotion(promotion, storeId)

    // Use shared helper — no duplication
    const enrichedProducts = products.map((p) => this.enrichProductWithPromo(p, promotion))

    return { promotion, products: enrichedProducts }
  }

  private async getProductsForPromotion(promotion: PromotionEntity, storeId: string) {
    return await this.productRepository.findOfferProducts({
      storeId,
      targetType: promotion.targetType,
      targetId: promotion.targetId,
      limit:
        promotion.targetType === PromotionTargetType.SPECIFIC_PRODUCT ||
        promotion.targetType === PromotionTargetType.SPECIFIC_CATEGORY ||
        promotion.targetType === PromotionTargetType.SPECIFIC_BRAND
          ? 50
          : 24,
    })
  }
}
