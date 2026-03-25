import { DiscountStrategy } from './Discount-strategy-interface'

export class FixedDiscountStrategy implements DiscountStrategy {
  calculate(baseAmount: number, value: number): number {
    return Number(value)
  }
}
