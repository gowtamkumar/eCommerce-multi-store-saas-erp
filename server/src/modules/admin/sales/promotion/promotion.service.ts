import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PromotionRepository } from './promotion.repository'
import { ProductRepository } from '@/modules/admin/catalog/product/product.repository'
import { CreatePromotionDto } from './dto/create-promotion.dto'
import { UpdatePromotionDto } from './dto/update-promotion.dto'
import { PromotionEntity } from './entities/promotion.entity'
import { PromotionTargetType } from './enums/promotion-target-type.enum'
import { PromotionType } from './enums/promotion-type.enum'

@Injectable()
export class PromotionService {
  private readonly logger = new Logger(PromotionService.name)

  constructor(
    private promotionRepository: PromotionRepository,
    private productRepository: ProductRepository,
  ) {}

  async createPromotion(createPromotionDto: CreatePromotionDto, tenantId: string) {
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

    return await this.promotionRepository.createAndSave(createPromotionDto, tenantId)
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
  }

  async findAllPromotions(filterDto: any, tenantId: string) {
    this.logger.log(`${this.findAllPromotions.name} Service Called`)
    const [promotions, total] = await this.promotionRepository.findAllWithFilters(filterDto, tenantId)
    return { promotions, total }
  }

  async findActivePromotions(tenantId: string) {
    this.logger.log(`${this.findActivePromotions.name} Service Called`)
    return await this.promotionRepository.findActivePromotions(tenantId, new Date())
  }

  async findOne(id: string, tenantId: string) {
    this.logger.log(`${this.findOne.name} Service Called`)
    const promotion = await this.promotionRepository.findById(id, tenantId)

    if (!promotion) {
      throw new NotFoundException('Promotion not found')
    }

    return promotion
  }

  async findOneBySlug(slug: string, tenantId: string) {
    this.logger.log(`${this.findOneBySlug.name} Service Called`)
    const promotion = await this.promotionRepository.findBySlug(slug, tenantId)
    if (!promotion) {
      throw new NotFoundException('Promotion not found')
    }
    return promotion
  }

  async updatePromotion(id: string, updatePromotionDto: UpdatePromotionDto, tenantId: string) {
    this.logger.log(`${this.updatePromotion.name} Service Called`)
    const promotion = await this.findOne(id, tenantId)
    return await this.promotionRepository.updateAndSave(promotion, updatePromotionDto)
  }

  async removePromotion(id: string, tenantId: string) {
    this.logger.log(`${this.removePromotion.name} Service Called`)
    const promotion = await this.findOne(id, tenantId)
    await this.promotionRepository.removePromotion(promotion)
    return { success: true, message: 'Promotion deleted successfully' }
  }

  /**
   * Public endpoint: returns all active promotions with their applicable products.
   * Used by the customer storefront /offers page.
   */
  async getOfferProducts(tenantId: string) {
    this.logger.log(`${this.getOfferProducts.name} Service Called`)

    const now = new Date()

    // Fetch all active, non-expired promotions for this tenant
    const promotions = await this.promotionRepository.findActivePromotions(tenantId, now)

    if (!promotions.length) {
      return { promotions: [], offerGroups: [] }
    }

    const getProducts = (promo: PromotionEntity) =>
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

    const offerGroups: Array<{
      promotion: PromotionEntity
      products: any[]
    }> = []

    for (const promotion of promotions) {
      let products = await getProducts(promotion)

      // Attach computed promo discount to each product
      const enrichedProducts = products.map((p) => {
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
      })

      if (enrichedProducts.length > 0) {
        offerGroups.push({ promotion, products: enrichedProducts })
      }
    }

    return { promotions, offerGroups }
  }

  async getOfferProductsBySlug(slug: string, tenantId: string) {
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

    const enrichedProducts = products.map((p) => {
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
    })

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
