import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'

export interface PaymentInitiationResult {
  gatewayUrl?: string
  success: boolean
  message?: string
  error?: string
  transactionId?: string
}

export interface PaymentStrategyOptions {
  callbackUrl: string
  storeId: string
  frontendUrl?: string
}

export interface PaymentCallbackResult {
  success: boolean
  transactionId: string
  gatewayResponse: any
  methodName: string
}

export interface PaymentVerificationParams {
  /** Server-side validator id returned by the gateway (e.g. SSLCommerz val_id). */
  valId?: string
  /** The transaction id we recorded on initiate. */
  transactionId: string
  storeId?: string
  storePassword?: string
  isSandbox?: boolean
  /** Expected amount as recorded on the invoice/order so we reject tampered callbacks. */
  expectedAmount: number
  /** Expected ISO currency. */
  expectedCurrency: string
  /** Tolerance for amount comparison to account for FX rounding from the gateway. */
  amountToleranceMinor?: number
}

export interface PaymentVerificationResult {
  success: boolean
  /** Raw response from the gateway validator API (or callback body for non-HTTP strategies). */
  gatewayResponse: any
  /** Human-readable reason on failure — never include credentials. */
  reason?: string
}

export interface PaymentStrategy {
  initiate(
    order: OrderEntity,
    settings: SiteSettingsEntity,
    options: PaymentStrategyOptions,
  ): Promise<PaymentInitiationResult>
  validateCallback(response: any, query?: any): Promise<PaymentCallbackResult>
  /**
   * Server-side authoritative verification. Strategies that need to talk to the gateway
   * (e.g. SSLCommerz validator API) must implement this; offline strategies (e.g. COD)
   * may return success synthetically.
   */
  verifyTransaction?(params: PaymentVerificationParams): Promise<PaymentVerificationResult>
  getRedirectUrl(response: any, appUrl: string): string
}
