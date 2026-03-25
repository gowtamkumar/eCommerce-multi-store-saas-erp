import { ShippingStrategy } from './shipping-strategy.interface';
import { InsideCityShippingStrategy } from './inside-city-shipping.strategy';
import { OutsideCityShippingStrategy } from './outside-city-shipping.strategy';
import { FreeShippingStrategy } from './free-shipping.strategy';

export class ShippingStrategyFactory {
  static create(shippingZone: string | undefined | null): ShippingStrategy {
    const zone = shippingZone?.toLowerCase();
    switch (zone) {
      case 'inside':
        return new InsideCityShippingStrategy();
      case 'outside':
        return new OutsideCityShippingStrategy();
      case 'free':
      case 'free_shipping':
        return new FreeShippingStrategy();
      default:
        // Default to returning 0 if no valid zone matches 
        // (preserves legacy PricingUtil logic which returned 0 when shippingZone undefined)
        return new FreeShippingStrategy();
    }
  }
}
