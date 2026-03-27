import { PromotionTargetType } from '@/modules/admin/sales/promotion/enums/promotion-target-type.enum'
import { PromotionTargetStrategy } from './promotion-target.strategy'
import { SpecificProductPromotionStrategy } from './specific-product-promotion.strategy'
import { SpecificCategoryPromotionStrategy } from './specific-category-promotion.strategy'
import { SpecificBrandPromotionStrategy } from './specific-brand-promotion.strategy'
import { EntireOrderPromotionStrategy } from './entire-order-promotion.strategy'
import { MinimumCartValuePromotionStrategy } from './minimum-cart-value-promotion.strategy'

export class PromotionTargetStrategyFactory {
  static create(targetType: PromotionTargetType | string): PromotionTargetStrategy {
    switch (targetType) {
      case PromotionTargetType.SPECIFIC_PRODUCT:
      case 'specific_product':
        return new SpecificProductPromotionStrategy()
      case PromotionTargetType.SPECIFIC_CATEGORY:
      case 'specific_category':
        return new SpecificCategoryPromotionStrategy()
      case PromotionTargetType.SPECIFIC_BRAND:
      case 'specific_brand':
        return new SpecificBrandPromotionStrategy()
      case PromotionTargetType.ENTIRE_ORDER:
      case 'entire_order':
        return new EntireOrderPromotionStrategy()
      case PromotionTargetType.MINIMUM_CART_VALUE:
      case 'minimum_cart_value':
        return new MinimumCartValuePromotionStrategy()
      default:
        throw new Error(`Unsupported promotion target type: ${targetType}`)
    }
  }
}
