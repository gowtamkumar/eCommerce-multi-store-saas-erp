export interface PriceBook {
  id: string;
  name: string;
  code: string;
  type: string;
  currency: string;
  isActive: boolean;
  validFrom?: string;
  validTo?: string;
}
