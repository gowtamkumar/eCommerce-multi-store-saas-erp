import { DiscountStrategy } from './Discount-strategy-interface'

export class FixedDiscountStrategy implements DiscountStrategy {
  calculate(value: number): number {
    return Number(value)
  }
}
