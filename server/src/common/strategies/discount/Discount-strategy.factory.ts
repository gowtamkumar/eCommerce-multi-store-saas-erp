import { PromotionType } from '@/modules/admin/sales/promotion/enums/promotion-type.enum'
import { DiscountType } from '@/common/enums/discount-type.enum'
import { DiscountStrategy } from './Discount-strategy-interface'
import { FixedDiscountStrategy } from './fixed-discount-strategy'
import { FreeShippingDiscountStrategy } from './free-shipping.strategy'
import { PercentageDiscountStrategy } from './percentage-discount.strategy'

export class DiscountStrategyFactory {
  static create(strategyType: DiscountType | PromotionType | string): DiscountStrategy {
    // Map various strings to the appropriate enum to handle coupons, promos, and product discounts
    switch (strategyType) {
      case DiscountType.FIXED:
        return new FixedDiscountStrategy()
      case DiscountType.PERCENTAGE:
        return new PercentageDiscountStrategy()
      case DiscountType.FREE_SHIPPING:
        return new FreeShippingDiscountStrategy()
    }

    throw new Error(`Unsupported discount strategy type: ${strategyType}`)
  }
}
