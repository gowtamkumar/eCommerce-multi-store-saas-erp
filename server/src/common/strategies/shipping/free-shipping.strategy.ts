import { ShippingStrategy } from './shipping-strategy.interface'

export class FreeShippingStrategy implements ShippingStrategy {
  calculate(config: any, payableSubtotal: number): number {
    return 0
  }
}
