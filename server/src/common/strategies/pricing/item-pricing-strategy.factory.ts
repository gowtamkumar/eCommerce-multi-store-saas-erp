import { ItemPricingStrategy } from './item-pricing-strategy.interface';
import { StandardItemPricingStrategy } from './standard-item-pricing.strategy';

export class ItemPricingStrategyFactory {
  static create(strategyType: string = 'standard'): ItemPricingStrategy {
    switch (strategyType.toLowerCase()) {
      case 'standard':
        return new StandardItemPricingStrategy();
      // Future strategies (e.g. 'inclusive_tax') can be added here
      default:
        return new StandardItemPricingStrategy();
    }
  }
}
