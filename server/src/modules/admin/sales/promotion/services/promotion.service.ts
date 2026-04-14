import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PromotionRepository } from '../repositories/promotion.repository'
import { ProductRepository } from '@/modules/admin/catalog/product/repositories/product.repository'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { CreatePromotionDto } from '../dto/create-promotion.dto'
import { UpdatePromotionDto } from '../dto/update-promotion.dto'
import { PromotionEntity } from '../entities/promotion.entity'
import { PromotionTargetType } from '../enums/promotion-target-type.enum'
import { PromotionType } from '../enums/promotion-type.enum'

@Injectable()
export class PromotionService {
  private readonly logger = new Logger(PromotionService.name)

  constructor(
    private promotionRepository: PromotionRepository,
    private productRepository: ProductRepository,
    private cache: CacheService,
  ) { }

  async createPromotion(createPromotionDto: CreatePromotionDto, tenantId: string): Promise<PromotionEntity> {
    this.logger.log(`${this.createPromotion.name} Service Called`)
    const slug = createPromotionDto.slug || this.generateSlug(createPromotionDto.name)

    // Check if slug exists
    const existing = await this.promotionRepository.findBySlug(slug, tenantId)
    if (existing) {
      // If auto-generated, append timestamp to make unique
      if (!createPromotionDto.slug) {
        return this.createPromotion(
          { ...createPromotionDto, slug: `${slug}-${Date.now().toString().slice(-4)}` },
          tenantId,
        )
      }
      throw new ConflictException('Promotion with this slug already exists')
    }

    const saved = await this.promotionRepository.createAndSave(createPromotionDto, tenantId)
    await this.cache.delCache(`promotions:active`, tenantId)
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
    tenantId: string,
  ): Promise<{ promotions: PromotionEntity[]; total: number }> {
    this.logger.log(`${this.findAllPromotions.name} Service Called`)
    const { page = 1, limit = 10, search = '', isActive } = filterDto
    const cacheKey = `promotions:list:p${page}:l${limit}:q${search}:a${isActive ?? 'all'}`

    return this.cache.rememberCache(
      cacheKey,
      async () => {
        const [promotions, total] = await this.promotionRepository.findAllWithFilters(filterDto, tenantId)
        return { promotions, total }
      },
      300, // 5 min TTL
      tenantId,
    )
  }

  async findActivePromotions(tenantId: string): Promise<PromotionEntity[]> {
    this.logger.log(`${this.findActivePromotions.name} Service Called`)
    const cacheKey = `promotions:active`

    return this.cache.rememberCache(
      cacheKey,
      () => this.promotionRepository.findActivePromotions(tenantId, new Date()),
      600, // 10 minutes
      tenantId
    )
  }

  async findOne(id: string, tenantId: string): Promise<PromotionEntity> {
    this.logger.log(`${this.findOne.name} Service Called`)
    const promotion = await this.cache.rememberCache(
      `promotions:id:${id}`,
      () => this.promotionRepository.findById(id, tenantId),
      600,
      tenantId,
    )
    if (!promotion) throw new NotFoundException('Promotion not found')
    return promotion
  }

  async findOneBySlug(slug: string, tenantId: string): Promise<PromotionEntity> {
    this.logger.log(`${this.findOneBySlug.name} Service Called`)
    const promotion = await this.cache.rememberCache(
      `promotions:slug:${slug}`,
      () => this.promotionRepository.findBySlug(slug, tenantId),
      600,
      tenantId,
    )
    if (!promotion) throw new NotFoundException('Promotion not found')
    return promotion
  }

  async updatePromotion(
    id: string,
    updatePromotionDto: UpdatePromotionDto,
    tenantId: string,
  ): Promise<PromotionEntity> {
    this.logger.log(`${this.updatePromotion.name} Service Called`)
    const promotion = await this.findOne(id, tenantId)
    const updated = await this.promotionRepository.updateAndSave(promotion, updatePromotionDto)
    // Invalidate all affected cache keys atomically
    await Promise.all([
      this.cache.delCache('promotions:active', tenantId),
      this.cache.delCache('promotions:list', tenantId),
      this.cache.delCache('promotions:offers', tenantId),
      this.cache.delCache(`promotions:id:${id}`, tenantId),
      this.cache.delCache(`promotions:slug:${promotion.slug}`, tenantId),
    ])
    return updated
  }

  async removePromotion(
    id: string,
    tenantId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`${this.removePromotion.name} Service Called`)
    const promotion = await this.findOne(id, tenantId)
    await this.promotionRepository.removePromotion(promotion)
    await Promise.all([
      this.cache.delCache('promotions:active', tenantId),
      this.cache.delCache('promotions:list', tenantId),
      this.cache.delCache('promotions:offers', tenantId),
      this.cache.delCache(`promotions:id:${id}`, tenantId),
      this.cache.delCache(`promotions:slug:${promotion.slug}`, tenantId),
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
    tenantId: string,
  ): Promise<{ promotions: PromotionEntity[]; offerGroups: any[] }> {
    this.logger.log(`${this.getOfferProducts.name} Service Called`)
    return this.cache.rememberCache(
      'promotions:offers',
      async () => {
        const now = new Date()
        const promotions = await this.promotionRepository.findActivePromotions(tenantId, now)

        if (!promotions.length) {
          return { promotions: [], offerGroups: [] }
        }

        // Fetch products for ALL promotions in PARALLEL (was sequential N+1 loop)
        const productResults = await Promise.all(
          promotions.map((promo) =>
            this.productRepository.findOfferProducts({
              tenantId,
              targetType: promo.targetType,
              targetId: promo.targetId,
              limit:
                promo.targetType === PromotionTargetType.ENTIRE_ORDER ||
                  promo.targetType === PromotionTargetType.MINIMUM_CART_VALUE
                  ? 12
                  : 20,
            })
          )
        )

        // Build enriched offer groups — filter out empty groups
        const offerGroups = promotions
          .map((promotion, i) => ({
            promotion,
            products: productResults[i].map((p) => this.enrichProductWithPromo(p, promotion)),
          }))
          .filter((g) => g.products.length > 0)

        return { promotions, offerGroups }
      },
      900, // 15 minutes — invalidated on write; read-heavy endpoint
      tenantId,
    )
  }

  async getOfferProductsBySlug(slug: string, tenantId: string): Promise<{ promotion: PromotionEntity; products: any[] }> {
    this.logger.log(`${this.getOfferProductsBySlug.name} Service Called`)
    const promotion = await this.findOneBySlug(slug, tenantId)

    const now = new Date()
    const isActive =
      promotion.isActive &&
      (!promotion.startDate || new Date(promotion.startDate) <= now) &&
      (!promotion.endDate || new Date(promotion.endDate) >= now)

    if (!isActive) {
      return { promotion, products: [] }
    }

    const products = await this.getProductsForPromotion(promotion, tenantId)

    // Use shared helper — no duplication
    const enrichedProducts = products.map((p) => this.enrichProductWithPromo(p, promotion))

    return { promotion, products: enrichedProducts }
  }

  private async getProductsForPromotion(promotion: PromotionEntity, tenantId: string) {
    return await this.productRepository.findOfferProducts({
      tenantId,
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
