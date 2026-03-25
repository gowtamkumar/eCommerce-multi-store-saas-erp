export interface PromotionStrategy {
  validate(cartTotal: number, coupon: any): void
  calculate(cartTotal: number, coupon: any): number
}
