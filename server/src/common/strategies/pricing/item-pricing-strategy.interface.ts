export interface ItemPricingResult {
  basePrice: number;
  discountAmount: number;
  discountedPrice: number;
  taxRate: number;
  taxAmount: number;
  finalPrice: number;
}

export interface ItemPricingStrategy {
  calculate(basePrice: number, discountAmount: number, taxRate: number): ItemPricingResult;
}
