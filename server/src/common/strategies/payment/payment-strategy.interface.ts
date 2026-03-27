import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity';
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity';

export interface PaymentInitiationResult {
  gatewayUrl?: string;
  success: boolean;
  message?: string;
  error?: string;
  transactionId?: string;
}

export interface PaymentStrategyOptions {
  callbackUrl: string;
  tenantId: string;
}

export interface PaymentCallbackResult {
  success: boolean;
  transactionId: string;
  gatewayResponse: any;
  methodName: string;
}

export interface PaymentStrategy {
  initiate(order: OrderEntity, settings: SiteSettingsEntity, options: PaymentStrategyOptions): Promise<PaymentInitiationResult>;
  validateCallback(response: any, query?: any): Promise<PaymentCallbackResult>;
  getRedirectUrl(response: any, appUrl: string): string;
}
