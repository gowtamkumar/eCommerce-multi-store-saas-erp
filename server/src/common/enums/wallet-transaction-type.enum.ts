export enum WalletTransactionType {
  STORE_CREDIT = 'STORE_CREDIT', // Issued when a return is refunded to wallet
  GIFT_VOUCHER = 'GIFT_VOUCHER', // Top-up from a gift voucher
  WALLET_SPEND = 'WALLET_SPEND', // Deducted at checkout (always negative amount)
  MANUAL_CREDIT = 'MANUAL_CREDIT', // Admin manual top-up
  MANUAL_DEBIT = 'MANUAL_DEBIT', // Admin manual correction/adjustment
  EXPIRY = 'EXPIRY', // Future: write-off of expired credits
}
