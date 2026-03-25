import { DiscountStrategy } from './Discount-strategy-interface'

export class FreeShippingDiscountStrategy implements DiscountStrategy {
  calculate(): number {
    return 0
  }
}
