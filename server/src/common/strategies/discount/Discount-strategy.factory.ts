import { PromotionType } from '@/modules/admin/sales/promotion/enums/promotion-type.enum'
import { DiscountType } from '@/common/enums/discount-type.enum'
import { DiscountStrategy } from './Discount-strategy-interface'
import { FixedDiscountStrategy } from './fixed-discount-strategy'
import { FreeShippingDiscountStrategy } from './free-shipping.strategy'
import { PercentageDiscountStrategy } from './percentage-discount.strategy'

export class DiscountStrategyFactory {
  static create(strategyType: DiscountType | PromotionType | string): DiscountStrategy {
    // Map various strings to the appropriate enum to handle coupons, promos, and product discounts
    if (strategyType === DiscountType.FIXED || strategyType === 'fixed') {
      return new FixedDiscountStrategy()
    }
    if (strategyType === DiscountType.PERCENTAGE || strategyType === 'percentage') {
      return new PercentageDiscountStrategy()
    }
    if (strategyType === DiscountType.FREE_SHIPPING || strategyType === PromotionType.FREE_SHIPPING || strategyType === 'free_shipping') {
      return new FreeShippingDiscountStrategy()
    }

    // For specific promo types like BOGO, we might just return 0 for now or implement a dedicated strategy
    if (strategyType === PromotionType.BOGO) {
      // Assuming BOGO isn't a direct monetary discount we calculate in the loop, or handle it via a new BogoStrategy
      return { calculate: (baseAmount, value) => 0 } // A dummy strategy or implement BogoDiscountStrategy when needed
    }

    throw new Error(`Unsupported discount strategy type: ${strategyType}`)
  }
}
