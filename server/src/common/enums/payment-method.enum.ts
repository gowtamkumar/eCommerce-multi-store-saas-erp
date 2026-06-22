/**
 * Unified payment method enum used across the entire platform:
 *  - Online orders (COD, SSLCOMMERZ)
 *  - POS sales (CASH, CARD, MOBILE, ON_ACCOUNT, WALLET)
 *  - Payment entity (strict DB enum — values are lowercase for backward compatibility)
 */
export enum PaymentMethod {
  // ── Online gateway methods ──────────────────────────────────────
  COD = 'cod',
  SSLCOMMERZ = 'sslcommerz',
  STRIPE = 'stripe',
  PAYPAL = 'paypal',

  // ── POS / manual payment methods ───────────────────────────────
  CASH = 'cash',
  CARD = 'card',
  MOBILE = 'mobile',
  ON_ACCOUNT = 'on_account',
  WALLET = 'wallet',
}
