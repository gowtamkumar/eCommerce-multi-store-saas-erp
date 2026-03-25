export interface DiscountStrategy {
  calculate(baseAmount: number, value: number): number
}
