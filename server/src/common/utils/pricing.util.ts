import { DiscountType } from '../enums/discount-type.enum';

export class PricingUtil {
  /**
   * Calculates the flat monetary value of a discount based on its type and base price.
   */
  static calculateDiscountAmount(
    basePrice: number,
    rawDiscount: number,
    discountType: DiscountType | string
  ): number {
    const discount = Number(rawDiscount) || 0;
    if (discountType === DiscountType.PERCENTAGE || discountType === 'percentage') {
      return (basePrice * discount) / 100;
    }
    if (discountType === DiscountType.FREE_SHIPPING || discountType === 'free_shipping') {
      return 0;
    }
    return discount;
  }

  /**
   * Calculates the exhaustive item pricing breakdown given its base price, applied discount, and tax rate.
   * Ensures the discount does not exceed the base price.
   */
  static calculateItemPricing(
    basePrice: number,
    discountAmount: number,
    taxRate: number
  ) {
    // Ensure discount doesn't exceed base price
    const actualDiscount = Math.min(Math.max(0, discountAmount), basePrice);
    const discountedPrice = basePrice - actualDiscount;

    const rate = Number(taxRate) || 0;
    const taxAmount = (discountedPrice * rate) / 100;
    const finalPrice = discountedPrice + taxAmount;

    return {
      basePrice,
      discountAmount: actualDiscount,
      discountedPrice,
      taxRate: rate,
      taxAmount,
      finalPrice
    };
  }

  /**
   * Calculates the shipping fee based on delivery zone, configuration, and order subtotal.
   */
  static calculateShippingFee(
    shippingZone: string | undefined,
    shippingConfig: any,
    payableSubtotal: number
  ): number {
    let shippingFee = 0;
    const config = shippingConfig || {};
    
    if (shippingZone) {
      if (shippingZone === 'inside') {
        shippingFee = Number(config.insideCityFee ?? 60);
      } else if (shippingZone === 'outside') {
        shippingFee = Number(config.outsideCityFee ?? 120);
      }

      const threshold = Number(config.freeShippingThreshold ?? 5000);
      if (threshold > 0 && payableSubtotal >= threshold) {
        shippingFee = 0;
      }
    }
    
    return shippingFee;
  }
}
