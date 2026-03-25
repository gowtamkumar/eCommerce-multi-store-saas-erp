import { DiscountStrategy } from './Discount-strategy-interface'

export class PercentageDiscountStrategy implements DiscountStrategy {
  calculate(baseAmount: number, value: number): number {
    return (Number(baseAmount) * Number(value)) / 100
  }
}
