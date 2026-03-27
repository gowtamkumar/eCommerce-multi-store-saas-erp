import { DiscountType } from '@/common/enums/discount-type.enum'
import { DiscountStrategyFactory } from '@/common/strategies/discount/Discount-strategy.factory'
import { ItemPricingStrategyFactory } from '@/common/strategies/pricing/item-pricing-strategy.factory'
import { PromotionTargetStrategyFactory } from '@/common/strategies/promotion/promotion-target-strategy.factory'
import { PromotionEntity } from '@/modules/admin/sales/promotion/entities/promotion.entity'
import { PromotionType } from '@/modules/admin/sales/promotion/enums/promotion-type.enum'
import { Injectable, Logger } from '@nestjs/common'

export interface PricingContextItem {
  id: string
  productId: string
  quantity: number
  product?: any
  variant?: any
}

export interface CartPricingResult {
  transformedItems: any[]
  subtotal: number
  totalDiscount: number
  totalTax: number
  payable: number
  orderLevelPromoDiscount: number
}

@Injectable()
export class PricingEngineService {
  private readonly logger = new Logger(PricingEngineService.name)

  /**
   * Calculates the exhaustive pricing breakdown for a cart context.
   */
  public calculateCart(
    items: PricingContextItem[],
    activePromotions: PromotionEntity[],
  ): CartPricingResult {
    this.logger.debug('Calculating cart pricing via Engine')

    let subtotal = 0
    let totalDiscount = 0
    let totalTax = 0

    // 1. Process individual items (Private Method Option 1)
    const transformedItems = (items || []).map((item) =>
      this.calculateItemPricing(item, activePromotions),
    )

    // 2. Aggregate Totals
    transformedItems.forEach((item) => {
      subtotal += item.pricing.base_price * item.quantity
      totalDiscount += item.pricing.discount * item.quantity
      totalTax += item.pricing.tax * item.quantity
    })

    let payable = subtotal - totalDiscount

    // 3. Process Order Level Promotions (Private Method Option 1)
    const orderLevelPromoDiscount = this.calculateOrderLevelPromotions(payable, activePromotions)

    // 4. Apply order-level promo discounts constraints
    const actualOrderLevelPromoDiscount = Math.min(orderLevelPromoDiscount, payable)
    payable -= actualOrderLevelPromoDiscount

    return {
      transformedItems,
      subtotal,
      totalDiscount: totalDiscount + actualOrderLevelPromoDiscount, // Combines product & order level discounts
      totalTax,
      payable: payable + totalTax, // Adds tax to the final payable amount
      orderLevelPromoDiscount: actualOrderLevelPromoDiscount,
    }
  }

  /**
   * Calculates logic for a single item against all promotions.
   */
  private calculateItemPricing(item: PricingContextItem, activePromotions: PromotionEntity[]) {
    this.logger.debug('Calculating Item pricing via Engine')
    const basePrice = Number(item.variant?.price || item.product?.price || 0)
    const discountType = item.product?.discountType || DiscountType.FIXED

    const discountStrategy = DiscountStrategyFactory.create(discountType as DiscountType)
    let discount = discountStrategy.calculate(basePrice, Number(item.product?.discountAmount || 0))

    // Evaluate promotional item discounts
    let bestPromoDiscount = 0
    for (const promo of activePromotions || []) {
      const targetStrategy = PromotionTargetStrategyFactory.create(promo.targetType)
      const applies = targetStrategy.isApplicable(promo, {
        productId: item.productId,
        categoryId: item.product?.categoryId,
        brandId: item.product?.brandId,
      })

      if (applies) {
        const promoDiscountStrategy = DiscountStrategyFactory.create(promo.promotionType as PromotionType)
        const calcDiscount = promoDiscountStrategy.calculate(basePrice, Number(promo.value))
        if (calcDiscount > bestPromoDiscount) {
          bestPromoDiscount = calcDiscount
        }
      }
    }

    discount = Math.max(discount, bestPromoDiscount)

    const taxRate = Number(item.product?.taxRate || 0)
    const pricingStrategy = ItemPricingStrategyFactory.create('standard')
    const pricing = pricingStrategy.calculate(basePrice, discount, taxRate)

    const quantity = Number(item.quantity)
    const lineTotal = pricing.finalPrice * quantity

    return {
      cart_item_id: item.id,
      product: {
        id: item.product?.id,
        name: item.product?.name,
        image: item.product?.images?.[0] || null,
      },
      variant: item.variant
        ? {
          id: item.variant.id,
          sku: item.variant.sku,
          attributes: item.variant.combination
            ? Object.entries(item.variant.combination).map(([name, value]) => ({
              name,
              value: String(value),
            }))
            : [],
        }
        : null,
      pricing: {
        base_price: pricing.basePrice,
        discount: pricing.discountAmount,
        tax: pricing.taxAmount,
        final_price: pricing.finalPrice,
      },
      quantity,
      line_total: lineTotal,
      stock_status:
        (item.variant?.stock || item.product?.stock || 0) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
    }
  }

  /**
   * Calculates logic for entire order or minimum cart value promotions.
   */
  private calculateOrderLevelPromotions(
    payable: number,
    activePromotions: PromotionEntity[],
  ): number {
    this.logger.debug('Calculating order level promotions via Engine')
    let orderLevelPromoDiscount = 0

    for (const promo of activePromotions || []) {
      const targetStrategy = PromotionTargetStrategyFactory.create(promo.targetType)
      const applies = targetStrategy.isApplicable(promo, { cartTotal: payable })

      if (applies) {
        const orderLevelPromoStrategy = DiscountStrategyFactory.create(
          promo.promotionType as string,
        )
        const calcDiscount = orderLevelPromoStrategy.calculate(payable, Number(promo.value))
        if (calcDiscount > orderLevelPromoDiscount) {
          orderLevelPromoDiscount = calcDiscount
        }
      }
    }

    return orderLevelPromoDiscount
  }
}
