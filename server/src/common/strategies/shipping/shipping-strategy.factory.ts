import { ShippingStrategy } from './shipping-strategy.interface';
import { InsideCityShippingStrategy } from './inside-city-shipping.strategy';
import { OutsideCityShippingStrategy } from './outside-city-shipping.strategy';
import { FreeShippingStrategy } from './free-shipping.strategy';
import { ShippingZoneType } from '@/common/enums/shipping-zone-type';
import { DiscountType } from '@/common/enums/discount-type.enum';

export class ShippingStrategyFactory {
  static create(shippingZone: string | undefined | null): ShippingStrategy {
    const zone = shippingZone?.toLowerCase();
    switch (zone) {
      case ShippingZoneType.INSIDE:
        return new InsideCityShippingStrategy();
      case ShippingZoneType.OUTSIDE:
        return new OutsideCityShippingStrategy();
      case 'free':
      case DiscountType.FREE_SHIPPING:
        return new FreeShippingStrategy();
      default:
        return new FreeShippingStrategy();
    }
  }
}
