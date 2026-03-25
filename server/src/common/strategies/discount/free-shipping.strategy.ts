import { DiscountStrategy } from './Discount-strategy-interface'

export class FreeShippingDiscountStrategy implements DiscountStrategy {
  calculate(baseAmount: number, value: number): number {
    return 0
  }
}
