export interface ShippingStrategy {
  calculate(config: any, payableSubtotal: number): number;
}
