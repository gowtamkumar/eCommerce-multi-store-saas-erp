import { ItemPricingStrategy, ItemPricingResult } from './item-pricing-strategy.interface'

export class StandardItemPricingStrategy implements ItemPricingStrategy {
  calculate(basePrice: number, discountAmount: number, taxRate: number): ItemPricingResult {
    // Ensure discount doesn't exceed base price
    const actualDiscount = Math.min(Math.max(0, discountAmount), basePrice)
    const discountedPrice = basePrice - actualDiscount

    const rate = Number(taxRate) || 0
    const taxAmount = (discountedPrice * rate) / 100
    const finalPrice = discountedPrice + taxAmount

    return {
      basePrice,
      discountAmount: actualDiscount,
      discountedPrice,
      taxRate: rate,
      taxAmount,
      finalPrice,
    }
  }
}
