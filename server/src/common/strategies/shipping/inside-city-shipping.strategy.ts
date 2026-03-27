import { ShippingStrategy } from './shipping-strategy.interface'

export class InsideCityShippingStrategy implements ShippingStrategy {
  calculate(config: any, payableSubtotal: number): number {
    const threshold = Number(config?.freeShippingThreshold ?? 5000)
    if (threshold > 0 && payableSubtotal >= threshold) return 0
    return Number(config?.insideCityFee ?? 60)
  }
}
